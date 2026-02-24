"use client";

import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type EngineEvent,
  type ExpressionAsset,
  PNGTuberEngine,
} from "@/lib/pngtuber-engine";
import { cn } from "@/lib/utils";

// ── Demo avatar assets ───────────────────────────────────────────────

const AVATAR_BASE =
  "/images/Small Witch Huge Wizard_pngtuber/Small Witch Huge Wizard";

const DEMO_EXPRESSIONS: ExpressionAsset[] = [
  { type: "idle", url: `${AVATAR_BASE}_idle.png` },
  { type: "talking", url: `${AVATAR_BASE}_talking.png` },
  { type: "blink", url: `${AVATAR_BASE}_blink.png` },
  { type: "blink_talking", url: `${AVATAR_BASE}_blink_talking.png` },
  { type: "happy", url: `${AVATAR_BASE}_happy.png` },
  { type: "happy_talking", url: `${AVATAR_BASE}_happy_talking.png` },
  { type: "sad", url: `${AVATAR_BASE}_sad.png` },
  { type: "sad_talking", url: `${AVATAR_BASE}_sad_talking.png` },
  { type: "angry", url: `${AVATAR_BASE}_angry.png` },
  { type: "angry_talking", url: `${AVATAR_BASE}_angry_talking.png` },
];

const WIDGET_AUDIO_URL = "/audio/girl.mp3";

// ── Mini waveform config (simplified 5-bar version) ──────────────────

const MINI_BARS = [
  { multiplier: 0.6, phase: 0 },
  { multiplier: 0.9, phase: 0.8 },
  { multiplier: 1.0, phase: 1.6 },
  { multiplier: 0.85, phase: 2.4 },
  { multiplier: 0.65, phase: 3.2 },
];

// ── Component ────────────────────────────────────────────────────────

export default function FloatingAvatar() {
  const [showBubble, setShowBubble] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [showLabel, setShowLabel] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PNGTuberEngine | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const barRafRef = useRef<number | null>(null);

  // ── Session dismiss persistence ──────────────────────────────────

  useEffect(() => {
    if (sessionStorage.getItem("widget-dismissed") === "true") {
      setIsDismissed(true);
    }
  }, []);

  // ── Engine lifecycle ─────────────────────────────────────────────

  const handleEvent = useCallback((event: EngineEvent) => {
    switch (event.type) {
      case "ready":
        setEngineReady(true);
        break;
      case "audioEnded":
        setIsPlaying(false);
        break;
      case "modeChange":
        if (event.mode !== "audio") {
          setIsPlaying(false);
        }
        break;
    }
  }, []);

  useEffect(() => {
    if (isDismissed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new PNGTuberEngine({
      canvas,
      expressions: DEMO_EXPRESSIONS,
      mode: "demo",
    });

    const unsub = engine.on(handleEvent);
    engineRef.current = engine;
    engine.start();

    return () => {
      unsub();
      engine.destroy();
      engineRef.current = null;
    };
  }, [isDismissed, handleEvent]);

  // ── Hide floating label after first bubble open ────────────────────

  useEffect(() => {
    if (showBubble) setShowLabel(false);
  }, [showBubble]);

  // ── Click outside to close bubble ──────────────────────────────────

  useEffect(() => {
    if (!showBubble) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setShowBubble(false);
      }
    };

    const id = requestAnimationFrame(() => {
      document.addEventListener("click", handleClickOutside);
    });

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showBubble]);

  // ── Mini waveform animation (RAF-driven, only when bubble open) ────

  const getVolume = useCallback(
    () => engineRef.current?.getNormalizedVolume() ?? 0,
    [],
  );

  useEffect(() => {
    if (!showBubble) {
      if (barRafRef.current) cancelAnimationFrame(barRafRef.current);
      return;
    }

    const animate = () => {
      const now = performance.now();
      for (let i = 0; i < MINI_BARS.length; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;
        const { multiplier, phase } = MINI_BARS[i];

        if (isPlaying) {
          const vol = getVolume();
          const timeFactor = Math.sin(now / 120 + phase) * 0.12 + 0.88;
          const h = 15 + 85 * vol * multiplier * timeFactor;
          bar.style.height = `${h}%`;
        } else {
          const wave = Math.sin(now / 600 + phase);
          bar.style.height = `${20 + 9 * wave}%`;
        }
      }
      barRafRef.current = requestAnimationFrame(animate);
    };

    barRafRef.current = requestAnimationFrame(animate);
    return () => {
      if (barRafRef.current) cancelAnimationFrame(barRafRef.current);
    };
  }, [showBubble, isPlaying, getVolume]);

  // ── Audio control ────────────────────────────────────────────────

  const toggleAudio = () => {
    if (isPlaying) {
      engineRef.current?.stopAudio();
      setIsPlaying(false);
    } else {
      engineRef.current?.playAudio(WIDGET_AUDIO_URL);
      setIsPlaying(true);
    }
  };

  // ── Dismiss (hide for session) ───────────────────────────────────

  const dismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("widget-dismissed", "true");
    engineRef.current?.destroy();
    engineRef.current = null;
  };

  if (isDismissed) return null;

  // ── Render ───────────────────────────────────────────────────────
  //
  // Avatar is ALWAYS visible at full size. Clicking it toggles a
  // speech-bubble dialogue above. Canvas never unmounts.

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40"
    >
      {/* ── Speech bubble (above avatar) ──────────────────────────── */}
      {showBubble && (
        <div className="absolute bottom-full right-0 mb-2 animate-fade-in">
          <div className="w-60 sm:w-72 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200/60 shadow-[0_8px_40px_rgba(6,182,212,0.15)] p-3 sm:p-4">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowBubble(false)}
              aria-label="Close dialogue"
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Message */}
            <p className="text-xs sm:text-sm text-gray-600 pr-5">
              Hey! I&apos;m Aria, your AI PNGTuber. Want to hear me talk?
            </p>

            {/* Audio control with mini waveform */}
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={toggleAudio}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer border",
                  isPlaying
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                    : "bg-primary/10 text-primary border-primary/25 hover:bg-primary/20 hover:border-primary/40",
                )}
              >
                <span className="flex items-end gap-[2px] h-3.5">
                  {MINI_BARS.map((bar, i) => (
                    <span
                      key={bar.phase}
                      ref={(el) => {
                        barsRef.current[i] = el;
                      }}
                      className={cn(
                        "w-[2px] rounded-full transition-[height] duration-75",
                        isPlaying ? "bg-white" : "bg-primary/50",
                      )}
                      style={{ height: "20%" }}
                    />
                  ))}
                </span>
                {isPlaying ? "Stop" : "Listen"}
              </button>

              <Link
                href="/create"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Create yours
              </Link>
            </div>

            {/* Dismiss */}
            <button
              type="button"
              onClick={dismiss}
              className="mt-2 text-[11px] text-gray-300 hover:text-gray-400 transition-colors"
            >
              Don&apos;t show again
            </button>
          </div>

          {/* Bubble tail pointing down-right toward avatar */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white/95 border-r border-b border-gray-200/60 rotate-45" />
        </div>
      )}

      {/* ── Avatar (always visible, full size) ────────────────────── */}
      <button
        type="button"
        className="relative w-24 h-24 sm:w-32 sm:h-32 animate-widget-bounce-in cursor-pointer hover:scale-105 transition-transform duration-200 bg-transparent border-0 p-0"
        onClick={() => setShowBubble((v) => !v)}
        aria-label="Talk to Aria"
      >
        {/* Floating "Hi!" label */}
        {showLabel && engineReady && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap bg-white rounded-full px-2.5 py-0.5 text-[11px] font-medium text-gray-700 shadow-md border border-gray-100 animate-fade-in pointer-events-none">
            Hi! I&apos;m Aria
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45" />
          </div>
        )}

        {/* Canvas — persistent, never unmounts */}
        <div className="w-full h-full overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>
      </button>
    </div>
  );
}
