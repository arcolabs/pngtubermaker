// ============================================================================
// PNGTuber Preview Engine — zero-framework-dependency TypeScript class
// ============================================================================

// ── Types ──────────────────────────────────────────────────────────────

export type EngineExpressionType =
  | "idle"
  | "talking"
  | "blink"
  | "blink_talking"
  | "happy"
  | "happy_talking"
  | "sad"
  | "sad_talking"
  | "angry"
  | "angry_talking";

export type EngineMode = "demo" | "mic";

export interface ExpressionAsset {
  type: EngineExpressionType;
  url: string;
}

export interface EngineConfig {
  canvas: HTMLCanvasElement;
  expressions: ExpressionAsset[];
  mode?: EngineMode;
  /** Volume threshold for mic mode (0-1). Default 0.06 */
  micThreshold?: number;
  /** Enable flip bounce on expression change. Default true */
  flipOnChange?: boolean;
  /** Crossfade duration in ms. Default 120 */
  fadeDuration?: number;
}

export type EngineEventType =
  | "ready"
  | "error"
  | "expressionChange"
  | "modeChange"
  | "loadProgress";

export interface EngineEvent {
  type: EngineEventType;
  expression?: EngineExpressionType;
  mode?: EngineMode;
  progress?: number; // 0-1
  error?: string;
}

export type EngineEventListener = (event: EngineEvent) => void;

// ── Helpers ────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// ── Engine ─────────────────────────────────────────────────────────────

export class PNGTuberEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private expressions: ExpressionAsset[];
  private mode: EngineMode;
  private micThreshold: number;
  private flipOnChange: boolean;
  private fadeDuration: number;

  // Loaded images keyed by expression type
  private imageMap = new Map<EngineExpressionType, HTMLImageElement>();

  // State
  private currentExpression: EngineExpressionType = "idle";
  private isTalking = false;
  private isBlinking = false;
  private destroyed = false;

  // Rendering
  private rafId: number | null = null;
  private lastRenderTime = 0;
  private flipScale = 1; // 1 = normal, goes to 0 and back for flip effect
  private flipDirection: "shrink" | "grow" | null = null;
  private pendingExpression: EngineExpressionType | null = null;

  // Blink timer
  private blinkTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private blinkEndTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Demo mode
  private demoSequence: EngineExpressionType[] = [];
  private demoIndex = 0;
  private demoIntervalId: ReturnType<typeof setInterval> | null = null;

  // Mic mode
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private micRafId: number | null = null;

  // Events
  private listeners: Set<EngineEventListener> = new Set();

  constructor(config: EngineConfig) {
    this.canvas = config.canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get 2d context");
    this.ctx = ctx;
    this.expressions = config.expressions;
    this.mode = config.mode ?? "demo";
    this.micThreshold = config.micThreshold ?? 0.06;
    this.flipOnChange = config.flipOnChange ?? true;
    this.fadeDuration = config.fadeDuration ?? 120;
  }

  // ── Public API ─────────────────────────────────────────────────────

  async start(): Promise<void> {
    if (this.destroyed) return;
    await this.preloadImages();
    if (this.destroyed) return;

    // Set canvas size to first image's natural size
    const firstImg = this.imageMap.values().next().value;
    if (firstImg) {
      this.canvas.width = firstImg.naturalWidth;
      this.canvas.height = firstImg.naturalHeight;
    }

    this.emit({ type: "ready" });
    this.startRenderLoop();
    this.startBlinkTimer();

    if (this.mode === "demo") {
      this.startDemo();
    } else {
      this.startMic();
    }
  }

  setMode(mode: EngineMode): void {
    if (mode === this.mode || this.destroyed) return;
    this.stopCurrentMode();
    this.mode = mode;
    this.emit({ type: "modeChange", mode });

    if (mode === "demo") {
      this.isTalking = false;
      this.startDemo();
    } else {
      this.startMic();
    }
  }

  updateConfig(partial: Partial<EngineConfig>): void {
    if (partial.micThreshold !== undefined)
      this.micThreshold = partial.micThreshold;
    if (partial.flipOnChange !== undefined)
      this.flipOnChange = partial.flipOnChange;
    if (partial.fadeDuration !== undefined)
      this.fadeDuration = partial.fadeDuration;
  }

  on(listener: EngineEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  destroy(): void {
    this.destroyed = true;
    this.stopCurrentMode();
    this.stopBlinkTimer();
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.listeners.clear();
    this.imageMap.clear();
  }

  // ── Image Preloading ───────────────────────────────────────────────

  private async preloadImages(): Promise<void> {
    const total = this.expressions.length;
    let loaded = 0;

    const promises = this.expressions.map(
      (asset) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            this.imageMap.set(asset.type, img);
            loaded++;
            this.emit({ type: "loadProgress", progress: loaded / total });
            resolve();
          };
          img.onerror = () => {
            // Non-critical: skip this expression
            loaded++;
            this.emit({ type: "loadProgress", progress: loaded / total });
            resolve();
          };
          img.src = asset.url;
        }),
    );

    await Promise.all(promises);

    if (!this.imageMap.has("idle") && this.imageMap.size > 0) {
      // Fallback: use first available as idle
      const first = this.imageMap.entries().next().value;
      if (first) this.imageMap.set("idle", first[1]);
    }

    if (this.imageMap.size === 0) {
      this.emit({ type: "error", error: "No images could be loaded" });
    }
  }

  // ── Render Loop ────────────────────────────────────────────────────

  private startRenderLoop(): void {
    const render = (timestamp: number) => {
      if (this.destroyed) return;

      const dt = timestamp - this.lastRenderTime;
      this.lastRenderTime = timestamp;

      this.updateFlip(dt);
      this.draw();

      this.rafId = requestAnimationFrame(render);
    };
    this.rafId = requestAnimationFrame(render);
  }

  private updateFlip(dt: number): void {
    if (!this.flipDirection) return;

    const speed = dt / (this.fadeDuration / 2);

    if (this.flipDirection === "shrink") {
      this.flipScale = Math.max(0, this.flipScale - speed);
      if (this.flipScale <= 0) {
        this.flipScale = 0;
        // Switch expression at midpoint
        if (this.pendingExpression) {
          this.currentExpression = this.pendingExpression;
          this.pendingExpression = null;
        }
        this.flipDirection = "grow";
      }
    } else {
      this.flipScale = Math.min(1, this.flipScale + speed);
      if (this.flipScale >= 1) {
        this.flipScale = 1;
        this.flipDirection = null;
      }
    }
  }

  private draw(): void {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height);

    const resolved = this.resolveExpression();
    const img = this.imageMap.get(resolved) ?? this.imageMap.get("idle");
    if (!img) return;

    ctx.save();

    if (this.flipOnChange && this.flipScale < 1) {
      // Horizontal flip/squeeze effect
      ctx.translate(width / 2, 0);
      ctx.scale(this.flipScale, 1);
      ctx.translate(-width / 2, 0);
    }

    ctx.drawImage(img, 0, 0, width, height);
    ctx.restore();
  }

  // ── State Resolution ───────────────────────────────────────────────

  private resolveExpression(): EngineExpressionType {
    const base = this.currentExpression;

    // For custom expressions (happy/sad/angry), resolve talking/blink variants
    if (base !== "idle" && base !== "talking") {
      // e.g. base = "happy"
      if (this.isBlinking && this.isTalking) {
        // No blink_talking variant for custom expressions, use talking variant
        const talkingVariant = `${base}_talking` as EngineExpressionType;
        if (this.imageMap.has(talkingVariant)) return talkingVariant;
        return base;
      }
      if (this.isTalking) {
        const talkingVariant = `${base}_talking` as EngineExpressionType;
        if (this.imageMap.has(talkingVariant)) return talkingVariant;
        return base;
      }
      // Blinking on custom expression: just show the base (no blink variant)
      return base;
    }

    // Base idle/talking flow
    if (this.isBlinking && this.isTalking) {
      if (this.imageMap.has("blink_talking")) return "blink_talking";
      if (this.imageMap.has("blink")) return "blink";
      return "talking";
    }
    if (this.isBlinking) {
      if (this.imageMap.has("blink")) return "blink";
      return "idle";
    }
    if (this.isTalking) {
      if (this.imageMap.has("talking")) return "talking";
      return "idle";
    }
    return "idle";
  }

  // ── Blink Timer ────────────────────────────────────────────────────

  private startBlinkTimer(): void {
    const scheduleBlink = () => {
      if (this.destroyed) return;
      const delay = randomBetween(3000, 7000);
      this.blinkTimeoutId = setTimeout(() => {
        if (this.destroyed) return;
        this.isBlinking = true;
        this.blinkEndTimeoutId = setTimeout(() => {
          this.isBlinking = false;
          scheduleBlink();
        }, 150);
      }, delay);
    };
    scheduleBlink();
  }

  private stopBlinkTimer(): void {
    if (this.blinkTimeoutId !== null) clearTimeout(this.blinkTimeoutId);
    if (this.blinkEndTimeoutId !== null) clearTimeout(this.blinkEndTimeoutId);
    this.isBlinking = false;
  }

  // ── Demo Mode ──────────────────────────────────────────────────────

  private buildDemoSequence(): EngineExpressionType[] {
    const seq: EngineExpressionType[] = [];

    // Always start with idle → talking
    seq.push("idle", "talking");

    // Add each custom expression and its talking variant if available
    const customBases = ["happy", "sad", "angry"] as const;
    for (const base of customBases) {
      if (this.imageMap.has(base)) {
        seq.push(base);
        const talkingVariant = `${base}_talking` as EngineExpressionType;
        if (this.imageMap.has(talkingVariant)) {
          seq.push(talkingVariant);
        }
      }
    }

    return seq;
  }

  private startDemo(): void {
    this.demoSequence = this.buildDemoSequence();
    if (this.demoSequence.length === 0) return;

    this.demoIndex = 0;
    this.setExpression(this.demoSequence[0]);

    // Determine talking state from expression type
    this.isTalking = this.demoSequence[0].includes("talking");

    this.demoIntervalId = setInterval(() => {
      if (this.destroyed) return;
      this.demoIndex = (this.demoIndex + 1) % this.demoSequence.length;
      const next = this.demoSequence[this.demoIndex];
      this.isTalking = next.includes("talking");
      this.setExpression(next);
    }, 1800);
  }

  private stopDemo(): void {
    if (this.demoIntervalId !== null) {
      clearInterval(this.demoIntervalId);
      this.demoIntervalId = null;
    }
  }

  // ── Mic Mode ───────────────────────────────────────────────────────

  private async startMic(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch {
      this.emit({
        type: "error",
        error: "Microphone access denied",
      });
      // Fallback to demo
      this.mode = "demo";
      this.emit({ type: "modeChange", mode: "demo" });
      this.startDemo();
      return;
    }

    if (this.destroyed) {
      this.stopMediaStream();
      return;
    }

    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const detectVolume = () => {
      if (this.destroyed || !this.analyser) return;

      this.analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / dataArray.length);

      const wasTalking = this.isTalking;
      this.isTalking = rms > this.micThreshold;

      // In mic mode, stay on idle base expression
      if (this.currentExpression !== "idle") {
        this.setExpression("idle");
      }

      // Emit expression change when talking state changes
      if (wasTalking !== this.isTalking) {
        this.emit({
          type: "expressionChange",
          expression: this.resolveExpression(),
        });
      }

      this.micRafId = requestAnimationFrame(detectVolume);
    };

    this.micRafId = requestAnimationFrame(detectVolume);

    // Reset to idle
    this.setExpression("idle");
  }

  private stopMic(): void {
    if (this.micRafId !== null) {
      cancelAnimationFrame(this.micRafId);
      this.micRafId = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.stopMediaStream();
  }

  private stopMediaStream(): void {
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }
  }

  // ── Expression Transitions ─────────────────────────────────────────

  private setExpression(type: EngineExpressionType): void {
    if (type === this.currentExpression && !this.pendingExpression) return;

    if (this.flipOnChange) {
      this.pendingExpression = type;
      this.flipDirection = "shrink";
    } else {
      this.currentExpression = type;
    }

    this.emit({ type: "expressionChange", expression: type });
  }

  // ── Mode Switching ─────────────────────────────────────────────────

  private stopCurrentMode(): void {
    this.stopDemo();
    this.stopMic();
    this.isTalking = false;
  }

  // ── Events ─────────────────────────────────────────────────────────

  private emit(event: EngineEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Swallow listener errors
      }
    }
  }
}
