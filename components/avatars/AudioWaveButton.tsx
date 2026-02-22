"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AudioWaveButtonProps {
  label: string;
  isPlaying: boolean;
  getVolume: () => number;
  onClick: () => void;
}

// 7 bars for a fuller, more visible wave
const BAR_CONFIG = [
  { id: "a", multiplier: 0.6, phase: 0 },
  { id: "b", multiplier: 0.85, phase: 0.5 },
  { id: "c", multiplier: 1.0, phase: 1.0 },
  { id: "d", multiplier: 0.9, phase: 1.5 },
  { id: "e", multiplier: 1.0, phase: 2.0 },
  { id: "f", multiplier: 0.8, phase: 2.5 },
  { id: "g", multiplier: 0.65, phase: 3.0 },
];
const BAR_COUNT = BAR_CONFIG.length;

// Height range (percentage of container)
const IDLE_BASE = 20;
const IDLE_RANGE = 18; // idle bars gently oscillate ±18%
const PLAY_MIN = 15;
const PLAY_MAX = 100;

export default function AudioWaveButton({
  label,
  isPlaying,
  getVolume,
  onClick,
}: AudioWaveButtonProps) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      const now = performance.now();

      if (isPlaying) {
        // Volume-driven: bars react to real audio level (pre-normalized 0-1)
        const volume = getVolume();

        for (let i = 0; i < BAR_COUNT; i++) {
          const bar = barsRef.current[i];
          if (!bar) continue;
          const { multiplier, phase } = BAR_CONFIG[i];
          const timeFactor = Math.sin(now / 120 + phase) * 0.12 + 0.88;
          const height =
            PLAY_MIN + (PLAY_MAX - PLAY_MIN) * volume * multiplier * timeFactor;
          bar.style.height = `${height}%`;
        }
      } else {
        // Idle: gentle sine wave so bars feel alive
        for (let i = 0; i < BAR_COUNT; i++) {
          const bar = barsRef.current[i];
          if (!bar) continue;
          const { phase } = BAR_CONFIG[i];
          const wave = Math.sin(now / 600 + phase);
          const height = IDLE_BASE + IDLE_RANGE * wave * 0.5;
          bar.style.height = `${height}%`;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, getVolume]);

  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border",
        isPlaying
          ? "bg-primary text-white border-primary shadow-lg shadow-primary/40 scale-105"
          : "bg-primary/10 text-primary border-primary/25 hover:bg-primary/20 hover:border-primary/40 backdrop-blur-sm",
      )}
      onClick={onClick}
    >
      {/* Wave bars */}
      <div className="flex items-end gap-[3px] h-5">
        {BAR_CONFIG.map((bar, i) => (
          <span
            key={bar.id}
            ref={(el) => {
              barsRef.current[i] = el;
            }}
            className={cn(
              "w-[3px] rounded-full transition-[height] duration-75",
              isPlaying ? "bg-white" : "bg-primary/50",
            )}
            style={{ height: `${IDLE_BASE}%` }}
          />
        ))}
      </div>
      {label}
    </button>
  );
}
