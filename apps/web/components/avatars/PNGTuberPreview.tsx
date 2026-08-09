"use client";

import { Mic, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import AudioWaveButton from "@/components/avatars/AudioWaveButton";
import {
  type EngineEvent,
  type EngineExpressionType,
  type EngineMode,
  type ExpressionAsset,
  PNGTuberEngine,
} from "@/lib/pngtuber-engine";
import { cn } from "@/lib/utils";

// Vertical mic meter constants
const THRESHOLD_MIN = 0.01;
const THRESHOLD_MAX = 0.2;
const METER_CEIL = 0.25; // covers the usable voice range

// Delay slider constants (ms)
const DELAY_MIN = 50;
const DELAY_MAX = 500;

interface PNGTuberPreviewProps {
  expressions: ExpressionAsset[];
  onExpressionChange?: (type: EngineExpressionType) => void;
  /** Called when user manually adjusts mic threshold (not on auto-calibration). */
  onMicThresholdChange?: (threshold: number) => void;
  /** Called when user adjusts speaking hold delay. */
  onSpeakingDelayChange?: (delayMs: number) => void;
}

const AUDIO_SAMPLES = [
  { id: "girl", label: "Luna", url: "/audio/girl.mp3" },
  { id: "female", label: "Aria", url: "/audio/female.mp3" },
  { id: "male", label: "Rex", url: "/audio/male.mp3" },
] as const;

export default function PNGTuberPreview({
  expressions,
  onExpressionChange,
  onMicThresholdChange,
  onSpeakingDelayChange,
}: PNGTuberPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PNGTuberEngine | null>(null);
  const modeRef = useRef<EngineMode>("demo");
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const cutoffTrackRef = useRef<HTMLDivElement>(null);
  const delayTrackRef = useRef<HTMLDivElement>(null);
  const isDraggingCutoff = useRef(false);
  const isDraggingDelay = useRef(false);

  const [mode, setMode] = useState<EngineMode>("demo");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const [micThreshold, setMicThreshold] = useState(0.06);
  const [speakingHoldMs, setSpeakingHoldMs] = useState(150);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Stable callback refs to avoid re-triggering effects
  const onExpressionChangeRef = useRef(onExpressionChange);
  onExpressionChangeRef.current = onExpressionChange;
  const onMicThresholdChangeRef = useRef(onMicThresholdChange);
  onMicThresholdChangeRef.current = onMicThresholdChange;
  const onSpeakingDelayChangeRef = useRef(onSpeakingDelayChange);
  onSpeakingDelayChangeRef.current = onSpeakingDelayChange;

  const handleEvent = useCallback((event: EngineEvent) => {
    switch (event.type) {
      case "ready":
        setLoading(false);
        break;
      case "loadProgress":
        setProgress(event.progress ?? 0);
        break;
      case "error":
        setError(event.error ?? "Unknown error");
        break;
      case "expressionChange":
        if (event.expression) {
          onExpressionChangeRef.current?.(event.expression);
        }
        break;
      case "modeChange":
        if (event.mode) {
          setMode(event.mode);
          // Don't overwrite modeRef when entering/exiting audio mode
          // (modeRef tracks the user-selected mode: demo or mic)
          if (event.mode !== "audio") {
            modeRef.current = event.mode;
          }
          if (event.mode === "demo") {
            setError(null);
          }
          if (event.mode !== "audio") {
            setAudioPlaying(null);
          }
        }
        break;
      case "audioEnded":
        setAudioPlaying(null);
        break;
      case "calibrating":
        setIsCalibrating(true);
        break;
      case "calibrated":
        setIsCalibrating(false);
        if (event.calibratedThreshold !== undefined) {
          setMicThreshold(event.calibratedThreshold);
          // Don't call onMicThresholdChange — only manual changes affect OBS URL
        }
        break;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || expressions.length === 0) return;

    setLoading(true);
    setProgress(0);
    setError(null);

    const engine = new PNGTuberEngine({
      canvas,
      expressions,
      mode: modeRef.current,
    });

    const unsubscribe = engine.on(handleEvent);
    engineRef.current = engine;

    engine.start();

    return () => {
      unsubscribe();
      engine.destroy();
      engineRef.current = null;
    };
  }, [expressions, handleEvent]);

  // Real-time volume bar — vertical, direct DOM (no React re-renders)
  useEffect(() => {
    if (mode !== "mic" || audioPlaying) return;
    let rafId: number;
    const update = () => {
      const vol = engineRef.current?.getVolume() ?? 0;
      if (volumeBarRef.current) {
        const pct = Math.min(100, (vol / METER_CEIL) * 100);
        volumeBarRef.current.style.height = `${pct}%`;
      }
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [mode, audioPlaying]);

  // ── Cutoff (threshold) handlers ──
  const handleThresholdChange = (threshold: number) => {
    setMicThreshold(threshold);
    engineRef.current?.updateConfig({ micThreshold: threshold });
    onMicThresholdChangeRef.current?.(threshold);
  };

  const thresholdPercent = Math.min(100, (micThreshold / METER_CEIL) * 100);

  const updateThresholdFromY = (clientY: number) => {
    const rect = cutoffTrackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fromBottom = 1 - (clientY - rect.top) / rect.height;
    const raw = Math.max(0, Math.min(1, fromBottom)) * METER_CEIL;
    handleThresholdChange(
      Math.max(THRESHOLD_MIN, Math.min(THRESHOLD_MAX, raw)),
    );
  };

  const onCutoffPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCalibrating) return;
    e.preventDefault();
    isDraggingCutoff.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateThresholdFromY(e.clientY);
  };
  const onCutoffPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCutoff.current) return;
    updateThresholdFromY(e.clientY);
  };
  const onCutoffPointerUp = () => {
    isDraggingCutoff.current = false;
  };

  // ── Delay (speaking hold) handlers ──
  const handleDelayChange = (delay: number) => {
    setSpeakingHoldMs(delay);
    engineRef.current?.updateConfig({ speakingHoldMs: delay });
    onSpeakingDelayChangeRef.current?.(delay);
  };

  const delayPercent =
    ((speakingHoldMs - DELAY_MIN) / (DELAY_MAX - DELAY_MIN)) * 100;

  const updateDelayFromY = (clientY: number) => {
    const rect = delayTrackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fromBottom = 1 - (clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, fromBottom));
    handleDelayChange(
      Math.round(DELAY_MIN + clamped * (DELAY_MAX - DELAY_MIN)),
    );
  };

  const onDelayPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingDelay.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateDelayFromY(e.clientY);
  };
  const onDelayPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingDelay.current) return;
    updateDelayFromY(e.clientY);
  };
  const onDelayPointerUp = () => {
    isDraggingDelay.current = false;
  };

  const switchMode = (newMode: EngineMode) => {
    if (newMode === mode) return;
    // If audio is playing, stop it first
    if (audioPlaying) {
      engineRef.current?.stopAudio();
      setAudioPlaying(null);
    }
    setMode(newMode);
    modeRef.current = newMode;
    setError(null);
    engineRef.current?.setMode(newMode);
  };

  const toggleAudio = (id: string, url: string) => {
    if (audioPlaying === id) {
      engineRef.current?.stopAudio();
      setAudioPlaying(null);
    } else {
      engineRef.current?.playAudio(url);
      setAudioPlaying(id);
    }
  };

  const getVolume = useCallback(
    () => engineRef.current?.getNormalizedVolume() ?? 0,
    [],
  );

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Header with title and mode toggle */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Live Preview</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Real-time animation preview
            </p>
          </div>
          {/* Mode toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              type="button"
              className={cn(
                "btn btn-xs gap-1 rounded-md border-0",
                mode === "demo" && !audioPlaying
                  ? "bg-white text-primary shadow-sm"
                  : "bg-transparent text-gray-500 hover:text-gray-700",
              )}
              onClick={() => switchMode("demo")}
            >
              <Play className="w-3 h-3" />
              Demo
            </button>
            <button
              type="button"
              className={cn(
                "btn btn-xs gap-1 rounded-md border-0",
                mode === "mic" && !audioPlaying
                  ? "bg-white text-primary shadow-sm"
                  : "bg-transparent text-gray-500 hover:text-gray-700",
              )}
              onClick={() => switchMode("mic")}
            >
              <Mic className="w-3 h-3" />
              Mic
            </button>
          </div>
        </div>

        {/* Canvas area with audio buttons on the left */}
        <div className="relative">
          {/* Canvas centered */}
          <div className="mx-auto max-w-[320px] sm:max-w-[400px] lg:max-w-[480px] aspect-square rounded-xl overflow-hidden bg-white relative">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-2">
                <span className="loading loading-spinner loading-md text-primary" />
                <span className="text-xs text-gray-500">
                  Loading {Math.round(progress * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Audio wave buttons — left side of canvas */}
          {!loading && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {AUDIO_SAMPLES.map((sample) => (
                <AudioWaveButton
                  key={sample.id}
                  label={sample.label}
                  isPlaying={audioPlaying === sample.id}
                  getVolume={getVolume}
                  onClick={() => toggleAudio(sample.id, sample.url)}
                />
              ))}
            </div>
          )}

          {/* Flat vertical bars — stroke-only, no panel */}
          {mode === "mic" && !audioPlaying && !loading && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
              {/* Bars row */}
              <div className="flex gap-5">
                {/* ── Green bar: volume + cutoff ── */}
                <div
                  ref={cutoffTrackRef}
                  className={cn(
                    "relative w-6 h-[280px] touch-none select-none",
                    isCalibrating
                      ? "pointer-events-none opacity-60"
                      : "cursor-ns-resize",
                  )}
                  onPointerDown={onCutoffPointerDown}
                  onPointerMove={onCutoffPointerMove}
                  onPointerUp={onCutoffPointerUp}
                >
                  {/* Track border + fill */}
                  <div className="absolute inset-0 rounded-sm border-2 border-[#2D3436] overflow-hidden">
                    <div
                      ref={volumeBarRef}
                      className="absolute bottom-0 left-0 right-0"
                      style={{ height: "0%", backgroundColor: "#63D13E" }}
                    />
                  </div>
                  {/* Cutoff marker — hollow ▶ + crossbar */}
                  <div
                    className="absolute left-0 right-0 flex items-center pointer-events-none"
                    style={{
                      bottom: `${thresholdPercent}%`,
                      transform: "translateY(50%)",
                    }}
                  >
                    {/* Hollow triangle pointing right */}
                    <svg
                      width="12"
                      height="16"
                      viewBox="0 0 12 16"
                      className="shrink-0 -ml-[12px]"
                      role="img"
                      aria-label="Cutoff marker"
                    >
                      <polygon
                        points="0,0 12,8 0,16"
                        fill="none"
                        stroke="#2D3436"
                        strokeWidth="2"
                      />
                    </svg>
                    {/* Crossbar across track */}
                    <div
                      className="flex-1 h-[2px]"
                      style={{ backgroundColor: "#2D3436" }}
                    />
                  </div>
                </div>

                {/* ── Purple bar: delay ── */}
                <div
                  ref={delayTrackRef}
                  className="relative w-6 h-[280px] touch-none select-none cursor-ns-resize"
                  onPointerDown={onDelayPointerDown}
                  onPointerMove={onDelayPointerMove}
                  onPointerUp={onDelayPointerUp}
                >
                  {/* Track border + fill */}
                  <div className="absolute inset-0 rounded-sm border-2 border-[#2D3436] overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: `${delayPercent}%`,
                        backgroundColor: "#5856D6",
                      }}
                    />
                  </div>
                  {/* Delay marker — hollow ◀ + crossbar */}
                  <div
                    className="absolute left-0 right-0 flex items-center pointer-events-none"
                    style={{
                      bottom: `${delayPercent}%`,
                      transform: "translateY(50%)",
                    }}
                  >
                    {/* Crossbar across track */}
                    <div
                      className="flex-1 h-[2px]"
                      style={{ backgroundColor: "#2D3436" }}
                    />
                    {/* Hollow triangle pointing left */}
                    <svg
                      width="12"
                      height="16"
                      viewBox="0 0 12 16"
                      className="shrink-0 -mr-[12px]"
                      role="img"
                      aria-label="Delay marker"
                    >
                      <polygon
                        points="12,0 0,8 12,16"
                        fill="none"
                        stroke="#2D3436"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Mic icon — spans both bars width */}
              <Mic
                className="w-10 h-10"
                style={{ color: "#2D3436" }}
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-xs text-center text-amber-600">
            {error === "Microphone access denied"
              ? "Microphone denied — using demo mode"
              : error}
          </p>
        )}

        <p className="text-sm text-amber-500/70 text-right mt-2">
          Background not transparent? Wait a moment and refresh.
        </p>
      </div>
    </div>
  );
}
