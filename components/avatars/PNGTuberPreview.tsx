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

interface PNGTuberPreviewProps {
  expressions: ExpressionAsset[];
  onExpressionChange?: (type: EngineExpressionType) => void;
}

const AUDIO_SAMPLES = [
  { id: "girl", label: "Luna", url: "/audio/girl.mp3" },
  { id: "female", label: "Aria", url: "/audio/female.mp3" },
  { id: "male", label: "Rex", url: "/audio/male.mp3" },
] as const;

export default function PNGTuberPreview({
  expressions,
  onExpressionChange,
}: PNGTuberPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PNGTuberEngine | null>(null);
  const modeRef = useRef<EngineMode>("demo");

  const [mode, setMode] = useState<EngineMode>("demo");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  // Stable callback ref to avoid re-triggering effect
  const onExpressionChangeRef = useRef(onExpressionChange);
  onExpressionChangeRef.current = onExpressionChange;

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
