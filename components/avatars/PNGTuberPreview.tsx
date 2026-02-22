"use client";

import { Mic, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
          modeRef.current = event.mode;
          if (event.mode === "demo") {
            setError(null);
          }
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

  const switchMode = (newMode: EngineMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    modeRef.current = newMode;
    setError(null);
    engineRef.current?.setMode(newMode);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time animation preview
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            className={cn(
              "btn btn-xs gap-1 rounded-md border-0",
              mode === "demo"
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
              mode === "mic"
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

      {/* Canvas container with solid background - Responsive sizing */}
      <div className="relative mx-auto max-w-[320px] sm:max-w-[400px] lg:max-w-[480px] aspect-square rounded-xl overflow-hidden bg-white">
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

      {/* Error message */}
      {error && (
        <p className="mt-2 text-xs text-center text-amber-600">
          {error === "Microphone access denied"
            ? "Microphone denied — using demo mode"
            : error}
        </p>
      )}
    </div>
  );
}
