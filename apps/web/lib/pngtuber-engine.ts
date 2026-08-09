// ============================================================================
// PNGTuber Preview Engine — sprite-animation-machine approach
//
// Inspired by game sprite animators:
// - Instant frame swap (no alpha crossfade — avoids white flash on transparent PNGs)
// - Squash & stretch bounce on expression change (classic animation principle)
// - Blinks are instant (eye closure is fast IRL, no transition needed)
// - Dual-layer talk detection: macro (isSpeaking) + micro (mouthOpen)
//   Macro: EMA smoothing + hysteresis + hold → stable "is person speaking?" signal
//   Micro: raw volume + short debounce + fallback oscillation → natural lip sync
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

export type EngineMode = "demo" | "mic" | "audio";

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
  /** Enable bounce animation on expression change. Default true */
  bounceOnChange?: boolean;
  /** Bounce animation duration in ms. Default 300 */
  bounceDuration?: number;
  /** Base URL for image proxy (to bypass CORS). Default '/api/proxy-image?url=' */
  proxyBaseUrl?: string;
  /** Disable ambient noise auto-calibration. Default false */
  disableCalibration?: boolean;
  /** How long speaking state holds after volume drops (ms). Default 150 */
  speakingHoldMs?: number;
}

export type EngineEventType =
  | "ready"
  | "error"
  | "expressionChange"
  | "modeChange"
  | "loadProgress"
  | "audioEnded"
  | "calibrating"
  | "calibrated";

export interface EngineEvent {
  type: EngineEventType;
  expression?: EngineExpressionType;
  mode?: EngineMode;
  progress?: number; // 0-1
  error?: string;
  calibratedThreshold?: number;
}

export type EngineEventListener = (event: EngineEvent) => void;

// ── Helpers ────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Hermite smoothstep interpolation (smooth start and end). */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

// ── Engine ─────────────────────────────────────────────────────────────

export class PNGTuberEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private expressions: ExpressionAsset[];
  private mode: EngineMode;
  private micThreshold: number;
  private bounceOnChange: boolean;
  private bounceDuration: number;
  private proxyBaseUrl: string;
  private speakingHoldMs: number;

  // Loaded images keyed by expression type
  private imageMap = new Map<EngineExpressionType, HTMLImageElement>();

  // State
  private currentExpression: EngineExpressionType = "idle";
  private isSpeaking = false; // macro: person is speaking (for bounce/events)
  private mouthOpen = false; // micro: mouth open this frame (for frame selection)
  private isBlinking = false;
  private destroyed = false;

  // Rendering (single unified RAF loop)
  private rafId: number | null = null;
  private lastRenderTime = 0;

  // Off-screen back buffer (eliminates clearRect flicker on visible canvas)
  private backCanvas: HTMLCanvasElement | null = null;
  private backCtx: CanvasRenderingContext2D | null = null;

  // Bounce animation state (squash & stretch)
  private bounceTime = 0;
  private bounceActive = false;
  private bounceAmplitude = 1;

  // Phase accumulators for continuous animation (avoids discontinuity when period changes)
  private breathPhase = 0;
  private swayPhase = 0;

  // Volume-proportional bounce
  private static readonly MIC_BOUNCE_AMPLITUDE_MIN = 0.3;
  private static readonly MIC_BOUNCE_AMPLITUDE_MAX = 1.0;

  // Activity-adaptive animation ranges (min = calm, max = active)
  private static readonly BREATH_AMPLITUDE_MIN = 0.002;
  private static readonly BREATH_AMPLITUDE_MAX = 0.005;
  private static readonly BREATH_PERIOD_MIN = 3000; // faster when active
  private static readonly BREATH_PERIOD_MAX = 4500; // slower when calm
  private static readonly SWAY_AMPLITUDE_MIN = 0.003;
  private static readonly SWAY_AMPLITUDE_MAX = 0.006;
  private static readonly SWAY_PERIOD_MIN = 4000;
  private static readonly SWAY_PERIOD_MAX = 6000;
  private static readonly ACTIVITY_EMA = 0.003; // ~5.5s half-life at 60fps

  // Arousal-based expression thresholds (hysteresis gap prevents oscillation)
  // Enter=0.85 requires ~10s sustained speaking; Exit=0.45 clears after ~4s silence
  private static readonly AROUSAL_ENTER = 0.85;
  private static readonly AROUSAL_EXIT = 0.45;

  // Context-aware blink timing
  private static readonly BLINK_DELAY_SPEAKING_MIN = 4000;
  private static readonly BLINK_DELAY_SPEAKING_MAX = 8000;
  private static readonly BLINK_DELAY_IDLE_MIN = 3000;
  private static readonly BLINK_DELAY_IDLE_MAX = 7000;
  private static readonly DOUBLE_BLINK_CHANCE = 0.25;
  private static readonly DOUBLE_BLINK_PAUSE = 100;
  private static readonly LONG_SILENCE_THRESHOLD = 10000;

  // Ambient noise calibration
  private static readonly CALIBRATION_DURATION_MS = 2000;
  private static readonly CALIBRATION_MIN_THRESHOLD = 0.02;
  private static readonly CALIBRATION_MAX_THRESHOLD = 0.15;
  private static readonly CALIBRATION_STDDEV_FACTOR = 1.5;

  // Blink timer
  private blinkTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private blinkEndTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private doubleBlinkTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Context-aware blink state
  private lastSpeakingEndTime = 0;

  // Activity level (0=calm, 1=active)
  private activityLevel = 0;
  private isAroused = false;

  // Calibration state
  private isCalibrating = false;
  private calibrationSamples: number[] = [];
  private calibrationStartTime = 0;
  private explicitThreshold = false;
  private disableCalibration = false;

  // Demo mode
  private demoSequence: EngineExpressionType[] = [];
  private demoIndex = 0;
  private demoIntervalId: ReturnType<typeof setInterval> | null = null;

  // Audio graph (shared AudioContext — reused across mode switches)
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private volumeDataArray: Uint8Array<ArrayBuffer> | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private mediaStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;

  // Volume detection — dual-layer
  //   Macro (isSpeaking): EMA smoothing + hysteresis + hold → stable speech detection
  //   Micro (mouthOpen):  raw volume + short debounce + fallback oscillation → lip sync
  private smoothedVolume = 0;
  private rawVolume = 0;
  private speakingHoldUntil = 0;
  private mouthOpenHoldUntil = 0;
  private mouthOpenSince = 0;
  private forcedCloseUntil = 0;
  private peakVolume = 0.01; // dynamic peak for normalization

  private static readonly MIC_SMOOTHING = 0.3; // EMA factor (macro)
  private static readonly MIC_CLOSE_RATIO = 0.65; // macro close = threshold × this
  private static readonly MOUTH_HOLD_MS = 30; // micro debounce (~2 frames)
  private static readonly MOUTH_CLOSE_RATIO = 0.5; // micro close = threshold × this
  private static readonly MOUTH_MAX_OPEN_MS = 200; // max continuous open before forced close
  private static readonly FORCED_CLOSE_MS = 70; // forced close duration
  private static readonly PEAK_DECAY = 0.998; // peak tracking decay per frame

  // Audio playback mode
  private modeBeforeAudio: EngineMode = "demo";

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
    this.bounceOnChange = config.bounceOnChange ?? true;
    this.bounceDuration = config.bounceDuration ?? 300;
    this.proxyBaseUrl = config.proxyBaseUrl ?? "/api/proxy-image?url=";
    this.speakingHoldMs = config.speakingHoldMs ?? 150;
    this.explicitThreshold = config.micThreshold !== undefined;
    this.disableCalibration = config.disableCalibration ?? false;
  }

  // ── Public API ─────────────────────────────────────────────────────

  /** Current smoothed volume (0-1 raw RMS). */
  getVolume(): number {
    return this.smoothedVolume;
  }

  /** Volume normalized against dynamic peak (0-1). Use for UI visualizations. */
  getNormalizedVolume(): number {
    if (this.peakVolume < 0.001) return 0;
    return Math.min(this.smoothedVolume / this.peakVolume, 1);
  }

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

    // Initialize off-screen back buffer (same size as visible canvas)
    this.backCanvas = document.createElement("canvas");
    this.backCanvas.width = this.canvas.width;
    this.backCanvas.height = this.canvas.height;
    this.backCtx = this.backCanvas.getContext("2d");

    this.emit({ type: "ready" });
    this.startRenderLoop();
    this.startBlinkTimer();

    if (this.mode === "demo") {
      this.startDemo();
    } else if (this.mode === "mic") {
      this.startMic();
    }
    // "audio" mode is started via playAudio(), not start()
  }

  setMode(mode: EngineMode): void {
    if (mode === this.mode || this.destroyed) return;
    this.stopCurrentMode();
    this.mode = mode;
    this.emit({ type: "modeChange", mode });

    if (mode === "demo") {
      this.isSpeaking = false;
      this.mouthOpen = false;
      this.startDemo();
    } else if (mode === "mic") {
      this.startMic();
    }
    // "audio" mode is started via playAudio(), not setMode()
  }

  /**
   * Play an audio file and drive the avatar's talking animation from its volume.
   * Saves the current mode and restores it when audio ends.
   */
  playAudio(url: string): void {
    if (this.destroyed) return;

    // Save current mode so we can restore after audio ends
    if (this.mode !== "audio") {
      this.modeBeforeAudio = this.mode;
    }

    this.stopCurrentMode();
    this.mode = "audio";
    this.emit({ type: "modeChange", mode: "audio" });
    this.startAudioPlayback(url);
  }

  /** Stop audio playback and restore previous mode. */
  stopAudio(): void {
    if (this.mode !== "audio") return;
    this.stopAudioPlayback();
    this.isSpeaking = false;
    this.mouthOpen = false;

    // Restore previous mode
    this.mode = this.modeBeforeAudio;
    this.emit({ type: "modeChange", mode: this.mode });

    if (this.mode === "demo") {
      this.startDemo();
    } else if (this.mode === "mic") {
      this.startMic();
    }
  }

  updateConfig(partial: Partial<EngineConfig>): void {
    if (partial.micThreshold !== undefined) {
      this.micThreshold = partial.micThreshold;
      this.explicitThreshold = true;
    }
    if (partial.bounceOnChange !== undefined)
      this.bounceOnChange = partial.bounceOnChange;
    if (partial.bounceDuration !== undefined)
      this.bounceDuration = partial.bounceDuration;
    if (partial.speakingHoldMs !== undefined)
      this.speakingHoldMs = partial.speakingHoldMs;
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
    // Close AudioContext only on destroy
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.volumeDataArray = null;
    this.backCanvas = null;
    this.backCtx = null;
    this.listeners.clear();
    this.imageMap.clear();
  }

  // ── Image Preloading ───────────────────────────────────────────────

  /**
   * Converts external URLs to proxy URLs to bypass CORS restrictions.
   * Canvas drawImage requires CORS-enabled images, so we proxy external images.
   */
  private getProxiedUrl(url: string): string {
    // If it's already a relative URL (same origin), no proxy needed
    if (url.startsWith("/")) {
      return url;
    }

    // If it's from our CDN domain, use proxy
    const cdnDomains = ["cdn.pngtubermaker.com", "pngtubermaker.com"];
    try {
      const urlObj = new URL(url);
      if (
        cdnDomains.some(
          (domain) =>
            urlObj.hostname === domain ||
            urlObj.hostname.endsWith(`.${domain}`),
        )
      ) {
        return `${this.proxyBaseUrl}${encodeURIComponent(url)}`;
      }
    } catch {
      // Invalid URL, return as-is
    }

    return url;
  }

  private async preloadImages(): Promise<void> {
    const total = this.expressions.length;
    let loaded = 0;

    const promises = this.expressions.map(
      (asset) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          // For proxied URLs, we don't need crossOrigin since they're same-origin
          // For external URLs, we still try with anonymous mode
          const proxiedUrl = this.getProxiedUrl(asset.url);
          if (proxiedUrl === asset.url) {
            img.crossOrigin = "anonymous";
          }
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
          img.src = proxiedUrl;
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

  // ── Audio Context Management (reused across mode switches) ─────────

  private ensureAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  private ensureAnalyser(): AnalyserNode {
    const ctx = this.ensureAudioContext();
    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 256;
    }
    if (!this.volumeDataArray) {
      this.volumeDataArray = new Uint8Array(
        this.analyser.frequencyBinCount,
      ) as Uint8Array<ArrayBuffer>;
    }
    return this.analyser;
  }

  /** Disconnect all source and analyser nodes (keeps AudioContext alive). */
  private disconnectAudioGraph(): void {
    if (this.micSourceNode) {
      try {
        this.micSourceNode.disconnect();
      } catch {}
      this.micSourceNode = null;
    }
    if (this.audioSourceNode) {
      try {
        this.audioSourceNode.disconnect();
      } catch {}
      this.audioSourceNode = null;
    }
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch {}
    }
  }

  // ── Render Loop (unified — volume detection + animation + draw) ────

  private startRenderLoop(): void {
    const render = (timestamp: number) => {
      if (this.destroyed) return;

      // Guard against first-frame spike (lastRenderTime starts at 0)
      const dt =
        this.lastRenderTime === 0 ? 16 : timestamp - this.lastRenderTime;
      this.lastRenderTime = timestamp;

      // Volume detection (only in mic/audio modes with active analyser)
      if (this.analyser && (this.mode === "mic" || this.mode === "audio")) {
        this.updateVolume();
      }

      this.updateBounce(dt);
      this.draw(dt);

      this.rafId = requestAnimationFrame(render);
    };
    this.rafId = requestAnimationFrame(render);
  }

  // ── Volume Detection (dual-layer, called per-frame from render loop) ──

  private updateVolume(): void {
    if (!this.analyser || !this.volumeDataArray) return;

    // During calibration, collect samples instead of normal processing
    if (this.isCalibrating) {
      this.updateCalibration();
      return;
    }

    this.analyser.getByteTimeDomainData(this.volumeDataArray);

    // Calculate RMS volume
    let sum = 0;
    for (let i = 0; i < this.volumeDataArray.length; i++) {
      const normalized = (this.volumeDataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    this.rawVolume = Math.sqrt(sum / this.volumeDataArray.length);

    // ── Macro layer: isSpeaking ──
    // EMA smoothing → hysteresis → hold time → stable speech detection
    this.smoothedVolume =
      this.smoothedVolume * (1 - PNGTuberEngine.MIC_SMOOTHING) +
      this.rawVolume * PNGTuberEngine.MIC_SMOOTHING;

    // Dynamic peak tracking for normalization
    this.peakVolume = Math.max(
      this.peakVolume * PNGTuberEngine.PEAK_DECAY,
      this.smoothedVolume,
    );

    const closeThreshold = this.micThreshold * PNGTuberEngine.MIC_CLOSE_RATIO;
    const wasSpeaking = this.isSpeaking;
    const now = performance.now();

    if (!this.isSpeaking) {
      if (this.smoothedVolume > this.micThreshold) {
        this.isSpeaking = true;
        this.speakingHoldUntil = now + this.speakingHoldMs;
      }
    } else {
      if (this.smoothedVolume > closeThreshold) {
        this.speakingHoldUntil = now + this.speakingHoldMs;
      } else if (now >= this.speakingHoldUntil) {
        this.isSpeaking = false;
      }
    }

    // ── Micro layer: mouthOpen ──
    // Raw volume + short debounce + fallback oscillation → natural lip sync
    const wasMouthOpen = this.mouthOpen;
    const mouthCloseThreshold =
      this.micThreshold * PNGTuberEngine.MOUTH_CLOSE_RATIO;

    if (this.isSpeaking) {
      if (now < this.forcedCloseUntil) {
        // In forced-close period (fallback oscillation)
        this.mouthOpen = false;
      } else if (
        this.mouthOpen &&
        now - this.mouthOpenSince > PNGTuberEngine.MOUTH_MAX_OPEN_MS
      ) {
        // Mouth open too long — force close to create natural rhythm
        this.forcedCloseUntil = now + PNGTuberEngine.FORCED_CLOSE_MS;
        this.mouthOpen = false;
      } else if (!this.mouthOpen) {
        if (this.rawVolume > this.micThreshold) {
          this.mouthOpen = true;
          this.mouthOpenSince = now;
          this.mouthOpenHoldUntil = now + PNGTuberEngine.MOUTH_HOLD_MS;
        }
      } else {
        // mouthOpen === true, check if should close
        if (this.rawVolume > mouthCloseThreshold) {
          this.mouthOpenHoldUntil = now + PNGTuberEngine.MOUTH_HOLD_MS;
        } else if (now >= this.mouthOpenHoldUntil) {
          this.mouthOpen = false;
        }
      }
    } else {
      this.mouthOpen = false;
      this.forcedCloseUntil = 0;
    }

    // Arousal-based expression: happy when excited, idle when calm
    const arousalTarget = this.resolveArousalExpression();
    if (this.currentExpression !== arousalTarget) {
      this.setExpression(arousalTarget);
    }

    // Emit events on state changes
    if (wasSpeaking !== this.isSpeaking) {
      // Macro state changed — volume-proportional bounce
      const normalizedVol =
        this.peakVolume > 0.001 ? this.smoothedVolume / this.peakVolume : 0.5;
      const bounceAmp =
        PNGTuberEngine.MIC_BOUNCE_AMPLITUDE_MIN +
        (PNGTuberEngine.MIC_BOUNCE_AMPLITUDE_MAX -
          PNGTuberEngine.MIC_BOUNCE_AMPLITUDE_MIN) *
          Math.min(normalizedVol, 1);
      this.triggerBounce(bounceAmp);

      // Track when speaking ends (for double-blink timing)
      if (!this.isSpeaking) {
        this.lastSpeakingEndTime = performance.now();
      }

      this.emit({
        type: "expressionChange",
        expression: this.resolveExpression(),
      });
    } else if (wasMouthOpen !== this.mouthOpen) {
      // Micro state changed — no bounce, just update displayed frame
      this.emit({
        type: "expressionChange",
        expression: this.resolveExpression(),
      });
    }

    // Activity EMA: move toward 1 when speaking, 0 when silent
    const activityTarget = this.isSpeaking ? 1 : 0;
    this.activityLevel +=
      (activityTarget - this.activityLevel) * PNGTuberEngine.ACTIVITY_EMA;
  }

  private resetVolumeState(): void {
    this.smoothedVolume = 0;
    this.rawVolume = 0;
    this.speakingHoldUntil = 0;
    this.mouthOpenHoldUntil = 0;
    this.mouthOpenSince = 0;
    this.forcedCloseUntil = 0;
    this.activityLevel = 0;
    this.isAroused = false;
    this.isCalibrating = false;
    this.calibrationSamples = [];
    this.calibrationStartTime = 0;
  }

  // ── Ambient Noise Calibration ─────────────────────────────────────

  private startCalibration(): void {
    this.isCalibrating = true;
    this.calibrationSamples = [];
    this.calibrationStartTime = performance.now();
    this.emit({ type: "calibrating" });
  }

  private updateCalibration(): void {
    if (!this.analyser || !this.volumeDataArray) return;

    this.analyser.getByteTimeDomainData(this.volumeDataArray);

    // Calculate RMS for this frame
    let sum = 0;
    for (let i = 0; i < this.volumeDataArray.length; i++) {
      const normalized = (this.volumeDataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / this.volumeDataArray.length);
    this.calibrationSamples.push(rms);

    // Check if calibration period is complete
    if (
      performance.now() - this.calibrationStartTime >=
      PNGTuberEngine.CALIBRATION_DURATION_MS
    ) {
      const n = this.calibrationSamples.length;
      if (n > 0) {
        const mean = this.calibrationSamples.reduce((a, b) => a + b, 0) / n;
        const variance =
          this.calibrationSamples.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
        const stddev = Math.sqrt(variance);
        const threshold = Math.min(
          Math.max(
            mean + stddev * PNGTuberEngine.CALIBRATION_STDDEV_FACTOR,
            PNGTuberEngine.CALIBRATION_MIN_THRESHOLD,
          ),
          PNGTuberEngine.CALIBRATION_MAX_THRESHOLD,
        );
        this.micThreshold = threshold;
        this.emit({ type: "calibrated", calibratedThreshold: threshold });
      }
      this.isCalibrating = false;
      this.calibrationSamples = [];
    }
  }

  // ── Bounce Animation (squash & stretch) ────────────────────────────

  private updateBounce(dt: number): void {
    if (!this.bounceActive) return;

    this.bounceTime += dt;
    if (this.bounceTime >= this.bounceDuration) {
      this.bounceActive = false;
      this.bounceTime = 0;
    }
  }

  /**
   * Squash & stretch curve — classic animation principle.
   * Amplitude is scaled by `bounceAmplitude` (1.0 = full, 0.3–1.0 = mic talk).
   *
   * At full amplitude (a=1):
   *   Phase 1 (0–35%):  Squash   (scaleY: 1.0 → 0.95)
   *   Phase 2 (35–65%): Stretch  (scaleY: 0.95 → 1.03, overshoot)
   *   Phase 3 (65–100%): Settle  (scaleY: 1.03 → 1.0)
   *
   * scaleX = 2 - scaleY to preserve visual area (volume preservation).
   * Anchor at bottom-center so the character "bounces on their feet".
   */
  private bounceScaleY(t: number): number {
    const a = this.bounceAmplitude;
    if (t < 0.35) {
      // Squash: 1.0 → 1 - 0.05*a
      const p = smoothstep(t / 0.35);
      return 1 - 0.05 * a * p;
    }
    if (t < 0.65) {
      // Stretch: (1-0.05*a) → (1+0.03*a)
      const p = smoothstep((t - 0.35) / 0.3);
      return 1 + a * (-0.05 + 0.08 * p);
    }
    // Settle: (1+0.03*a) → 1.0
    const p = smoothstep((t - 0.65) / 0.35);
    return 1 + 0.03 * a * (1 - p);
  }

  // ── Draw ───────────────────────────────────────────────────────────

  private draw(dt: number): void {
    const { width, height } = this.canvas;

    // Resolve which frame to display this tick
    const resolved = this.resolveExpression();
    const img = this.imageMap.get(resolved) ?? this.imageMap.get("idle");
    if (!img) return;

    // ── Draw to off-screen back buffer first ──
    // This eliminates the clearRect → transparent intermediate state on the
    // visible canvas, which can be sampled by compositors / OBS capture
    // between clear and draw, causing brightness flicker.
    const back = this.backCtx ?? this.ctx;
    back.clearRect(0, 0, width, height);
    back.globalAlpha = 1;
    back.globalCompositeOperation = "source-over";

    // ── Compose transforms (all anchored at bottom-center) ──

    // Activity-adaptive breathing (subtle scaleY sine wave)
    // Uses phase accumulator: period changes only affect advance rate, not current position
    const a = this.activityLevel;
    const breathAmp =
      PNGTuberEngine.BREATH_AMPLITUDE_MIN +
      (PNGTuberEngine.BREATH_AMPLITUDE_MAX -
        PNGTuberEngine.BREATH_AMPLITUDE_MIN) *
        a;
    const breathPeriod =
      PNGTuberEngine.BREATH_PERIOD_MAX -
      (PNGTuberEngine.BREATH_PERIOD_MAX - PNGTuberEngine.BREATH_PERIOD_MIN) * a;
    this.breathPhase += (dt / breathPeriod) * Math.PI * 2;
    if (this.breathPhase > Math.PI * 2) this.breathPhase -= Math.PI * 2;
    const breathSy = 1 + breathAmp * Math.sin(this.breathPhase);

    // Activity-adaptive sway (subtle rotation sine wave)
    const swayAmp =
      PNGTuberEngine.SWAY_AMPLITUDE_MIN +
      (PNGTuberEngine.SWAY_AMPLITUDE_MAX - PNGTuberEngine.SWAY_AMPLITUDE_MIN) *
        a;
    const swayPeriod =
      PNGTuberEngine.SWAY_PERIOD_MAX -
      (PNGTuberEngine.SWAY_PERIOD_MAX - PNGTuberEngine.SWAY_PERIOD_MIN) * a;
    this.swayPhase += (dt / swayPeriod) * Math.PI * 2;
    if (this.swayPhase > Math.PI * 2) this.swayPhase -= Math.PI * 2;
    const swayAngle = swayAmp * Math.sin(this.swayPhase);

    // Triggered: bounce (squash & stretch, only when active)
    let bounceSx = 1;
    let bounceSy = 1;
    if (this.bounceActive) {
      const bt = this.bounceTime / this.bounceDuration;
      bounceSy = this.bounceScaleY(bt);
      bounceSx = 2 - bounceSy; // Volume preservation
    }

    // Combine scales
    const finalSx = bounceSx;
    const finalSy = breathSy * bounceSy;

    back.save();
    // Anchor at bottom-center (character "stands" at bottom edge)
    back.translate(width / 2, height);
    back.rotate(swayAngle);
    back.scale(finalSx, finalSy);
    back.translate(-width / 2, -height);
    back.drawImage(img, 0, 0, width, height);
    back.restore();

    // ── Atomic copy to visible canvas ──
    // Single drawImage with "copy" mode — no clearRect on the visible canvas,
    // so it is never in a transparent state between frames.
    if (this.backCanvas) {
      const ctx = this.ctx;
      ctx.globalCompositeOperation = "copy";
      ctx.drawImage(this.backCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // ── State Resolution ───────────────────────────────────────────────

  private resolveExpression(): EngineExpressionType {
    const base = this.currentExpression;
    const showTalking = this.mouthOpen;

    // For custom expressions (happy/sad/angry), resolve talking/blink variants
    if (base !== "idle" && base !== "talking") {
      if (this.isBlinking && showTalking) {
        const talkingVariant = `${base}_talking` as EngineExpressionType;
        if (this.imageMap.has(talkingVariant)) return talkingVariant;
        return base;
      }
      if (showTalking) {
        const talkingVariant = `${base}_talking` as EngineExpressionType;
        if (this.imageMap.has(talkingVariant)) return talkingVariant;
        return base;
      }
      // Blinking on custom expression: just show the base (no blink variant)
      return base;
    }

    // Base idle/talking flow
    if (this.isBlinking && showTalking) {
      if (this.imageMap.has("blink_talking")) return "blink_talking";
      if (this.imageMap.has("blink")) return "blink";
      return "talking";
    }
    if (this.isBlinking) {
      if (this.imageMap.has("blink")) return "blink";
      return "idle";
    }
    if (showTalking) {
      if (this.imageMap.has("talking")) return "talking";
      return "idle";
    }
    return "idle";
  }

  /**
   * Arousal-based expression selection with hysteresis.
   * Switches to "happy" after ~10s sustained speaking, back to "idle" after ~4s silence.
   * No-op if imageMap lacks a "happy" expression.
   */
  private resolveArousalExpression(): EngineExpressionType {
    if (
      !this.isAroused &&
      this.activityLevel > PNGTuberEngine.AROUSAL_ENTER &&
      this.imageMap.has("happy")
    ) {
      this.isAroused = true;
    } else if (
      this.isAroused &&
      this.activityLevel < PNGTuberEngine.AROUSAL_EXIT
    ) {
      this.isAroused = false;
    }
    return this.isAroused ? "happy" : "idle";
  }

  // ── Blink Timer ────────────────────────────────────────────────────

  private startBlinkTimer(): void {
    const scheduleBlink = () => {
      if (this.destroyed) return;

      // Context-aware timing: blink less when speaking
      const [delayMin, delayMax] = this.isSpeaking
        ? [
            PNGTuberEngine.BLINK_DELAY_SPEAKING_MIN,
            PNGTuberEngine.BLINK_DELAY_SPEAKING_MAX,
          ]
        : [
            PNGTuberEngine.BLINK_DELAY_IDLE_MIN,
            PNGTuberEngine.BLINK_DELAY_IDLE_MAX,
          ];
      const delay = randomBetween(delayMin, delayMax);

      this.blinkTimeoutId = setTimeout(() => {
        if (this.destroyed) return;
        this.isBlinking = true;
        this.blinkEndTimeoutId = setTimeout(() => {
          this.isBlinking = false;

          // Double-blink chance after long silence
          const now = performance.now();
          const silenceDuration =
            this.lastSpeakingEndTime > 0
              ? now - this.lastSpeakingEndTime
              : Number.POSITIVE_INFINITY;

          const shouldDoubleBlink =
            !this.isSpeaking &&
            silenceDuration > PNGTuberEngine.LONG_SILENCE_THRESHOLD &&
            Math.random() < PNGTuberEngine.DOUBLE_BLINK_CHANCE;

          if (shouldDoubleBlink) {
            this.doubleBlinkTimeoutId = setTimeout(() => {
              if (this.destroyed) return;
              this.isBlinking = true;
              this.blinkEndTimeoutId = setTimeout(() => {
                this.isBlinking = false;
                scheduleBlink();
              }, 150);
            }, PNGTuberEngine.DOUBLE_BLINK_PAUSE);
          } else {
            scheduleBlink();
          }
        }, 150);
      }, delay);
    };
    scheduleBlink();
  }

  private stopBlinkTimer(): void {
    if (this.blinkTimeoutId !== null) clearTimeout(this.blinkTimeoutId);
    if (this.blinkEndTimeoutId !== null) clearTimeout(this.blinkEndTimeoutId);
    if (this.doubleBlinkTimeoutId !== null)
      clearTimeout(this.doubleBlinkTimeoutId);
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

  /**
   * Apply a demo sequence entry: decompose into base expression + mouthOpen.
   * e.g. "happy_talking" → base="happy", mouthOpen=true
   *      "talking"       → base="idle",  mouthOpen=true
   *      "idle"          → base="idle",  mouthOpen=false
   */
  private applyDemoEntry(entry: EngineExpressionType): void {
    const isTalkingEntry = entry === "talking" || entry.endsWith("_talking");

    let baseExpression: EngineExpressionType;
    if (entry === "talking") {
      baseExpression = "idle";
    } else if (entry.endsWith("_talking")) {
      baseExpression = entry.replace("_talking", "") as EngineExpressionType;
    } else {
      baseExpression = entry;
    }

    const mouthChanged = this.mouthOpen !== isTalkingEntry;
    this.mouthOpen = isTalkingEntry;

    if (baseExpression !== this.currentExpression) {
      // Base expression changed — setExpression triggers full bounce
      this.setExpression(baseExpression);
    } else if (mouthChanged) {
      // Same base but mouth state changed — half bounce (fixed for demo)
      this.triggerBounce(0.5);
      this.emit({
        type: "expressionChange",
        expression: this.resolveExpression(),
      });
    }
  }

  private startDemo(): void {
    this.demoSequence = this.buildDemoSequence();
    if (this.demoSequence.length === 0) return;

    this.demoIndex = 0;
    this.applyDemoEntry(this.demoSequence[0]);

    this.demoIntervalId = setInterval(() => {
      if (this.destroyed) return;
      this.demoIndex = (this.demoIndex + 1) % this.demoSequence.length;
      this.applyDemoEntry(this.demoSequence[this.demoIndex]);
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
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "getUserMedia not available (not a secure context or unsupported browser)",
        );
      }
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      this.emit({
        type: "error",
        error: `Microphone access denied: ${detail}`,
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

    const ctx = this.ensureAudioContext();
    const analyser = this.ensureAnalyser();
    this.disconnectAudioGraph();

    this.micSourceNode = ctx.createMediaStreamSource(this.mediaStream);
    this.micSourceNode.connect(analyser);
    // Mic: don't connect to destination (don't play mic audio through speakers)

    this.resetVolumeState();

    // Start ambient noise calibration unless disabled or user set explicit threshold
    if (!this.disableCalibration && !this.explicitThreshold) {
      this.startCalibration();
    }

    this.setExpression("idle");
  }

  private stopMic(): void {
    if (this.micSourceNode) {
      try {
        this.micSourceNode.disconnect();
      } catch {}
      this.micSourceNode = null;
    }
    this.stopMediaStream();
    this.resetVolumeState();
  }

  private stopMediaStream(): void {
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }
  }

  // ── Audio Playback Mode ───────────────────────────────────────────

  private startAudioPlayback(url: string): void {
    // Clean up any previous audio playback
    this.stopAudioPlayback();

    const ctx = this.ensureAudioContext();
    const analyser = this.ensureAnalyser();
    this.disconnectAudioGraph();

    this.audioElement = new Audio(url);
    this.audioElement.crossOrigin = "anonymous";
    this.audioSourceNode = ctx.createMediaElementSource(this.audioElement);
    // Audio: source → analyser → destination (play through speakers)
    this.audioSourceNode.connect(analyser);
    analyser.connect(ctx.destination);

    this.audioElement.addEventListener("ended", this.handleAudioEnded);
    this.audioElement.play().catch((err) => {
      this.emit({ type: "error", error: `Audio playback failed: ${err}` });
      this.stopAudio();
    });

    this.resetVolumeState();
    this.setExpression("idle");
  }

  private handleAudioEnded = (): void => {
    this.emit({ type: "audioEnded" });
    this.stopAudio();
  };

  private stopAudioPlayback(): void {
    if (this.audioElement) {
      this.audioElement.removeEventListener("ended", this.handleAudioEnded);
      this.audioElement.pause();
      this.audioElement = null;
    }
    if (this.audioSourceNode) {
      try {
        this.audioSourceNode.disconnect();
      } catch {}
      this.audioSourceNode = null;
    }
    // Disconnect analyser from destination (was connected for audio playback)
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch {}
    }
    this.resetVolumeState();
  }

  // ── Expression Changes ──────────────────────────────────────────────

  /**
   * Trigger a bounce animation with the given amplitude.
   * amplitude: 1.0 = full (expression change), 0.3–1.0 = volume-proportional (mic talk)
   */
  private triggerBounce(amplitude: number): void {
    if (!this.bounceOnChange) return;
    this.bounceTime = 0;
    this.bounceAmplitude = amplitude;
    this.bounceActive = true;
  }

  private setExpression(type: EngineExpressionType): void {
    if (type === this.currentExpression) return;

    this.currentExpression = type;
    this.triggerBounce(1.0);
    this.emit({
      type: "expressionChange",
      expression: this.resolveExpression(),
    });
  }

  // ── Mode Switching ─────────────────────────────────────────────────

  private stopCurrentMode(): void {
    this.stopDemo();
    this.stopMic();
    this.stopAudioPlayback();
    this.isSpeaking = false;
    this.mouthOpen = false;
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
