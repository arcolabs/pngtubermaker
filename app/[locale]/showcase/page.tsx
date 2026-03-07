"use client";

import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

// ============================================
// Configuration - Three rounds
// ============================================

interface ShowcaseRound {
  prompt: string;
  folder: string;
  expressions: {
    idle: string;
    happy: string;
    sad: string;
    angry: string;
  };
}

const ROUNDS: ShowcaseRound[] = [
  {
    prompt: "Classic Magical Girl Long hair with moon staff",
    folder: "round1",
    expressions: {
      idle: "/test/round1_idle.png",
      happy: "/test/round1_happy.png",
      sad: "/test/round1_sad.png",
      angry: "/test/round1_angry.png",
    },
  },
  {
    prompt: "Small Witch Huge Wizard hat with potion",
    folder: "round2",
    expressions: {
      idle: "/test/round2_idle.png",
      happy: "/test/round2_happy.png",
      sad: "/test/round2_sad.png",
      angry: "/test/round2_angry.png",
    },
  },
  {
    prompt: "Young Woman Voluminous Wavy hair with flowers",
    folder: "round3",
    expressions: {
      idle: "/test/round3_idle.png",
      happy: "/test/round3_happy.png",
      sad: "/test/round3_sad.png",
      angry: "/test/round3_angry.png",
    },
  },
];

const EXPRESSION_LABELS: {
  key: keyof ShowcaseRound["expressions"];
  label: string;
}[] = [
  { key: "idle", label: "Idle" },
  { key: "happy", label: "Happy" },
  { key: "sad", label: "Sad" },
  { key: "angry", label: "Angry" },
];

// ============================================
// Flow steps
// ============================================

type FlowStep =
  | "idle" // waiting for Space
  | "typing" // prompt typing out
  | "generating" // generation progress
  | "results" // expression cards appear
  | "done"; // waiting for Space to advance to next round

// ============================================
// Main Page
// ============================================

export default function ShowcasePage() {
  const [currentRound, setCurrentRound] = useState(0);
  const [step, setStep] = useState<FlowStep>("idle");
  const [displayedPrompt, setDisplayedPrompt] = useState("");
  const [autoPlay, _setAutoPlay] = useState(false);

  const flowRunning = useRef(false);
  const round = ROUNDS[currentRound % ROUNDS.length];

  // ── Typing animation ──────────────────────────────────────────────
  const runTyping = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const text = round.prompt;
        let i = 0;
        setDisplayedPrompt("");
        const interval = setInterval(() => {
          i++;
          setDisplayedPrompt(text.slice(0, i));
          if (i >= text.length) {
            clearInterval(interval);
            resolve();
          }
        }, 40);
      }),
    [round.prompt],
  );

  // ── Generation animation ──────────────────────────────────────────
  const runGeneration = useCallback(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1500);
      }),
    [],
  );

  // ── Full flow for one round ───────────────────────────────────────
  const runFlow = useCallback(async () => {
    if (flowRunning.current) return;
    flowRunning.current = true;

    // Step 1: Typing
    setStep("typing");
    await runTyping();

    // Brief pause after typing
    await new Promise((r) => setTimeout(r, 300));

    // Step 2: Generating
    setStep("generating");
    await runGeneration();

    // Step 3: Show results
    setStep("results");

    // Show results for a while
    await new Promise((r) => setTimeout(r, 2000));

    // Step 4: Done - ready for next round
    setStep("done");
    flowRunning.current = false;
  }, [runTyping, runGeneration]);

  // ── Advance to next round ─────────────────────────────────────────
  const nextRound = useCallback(() => {
    setStep("idle");
    setDisplayedPrompt("");
    flowRunning.current = false;
    setCurrentRound((prev) => (prev + 1) % ROUNDS.length);
  }, []);

  // ── Keyboard handler ──────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();

      if (step === "idle") {
        runFlow();
      } else if (step === "done") {
        nextRound();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step, runFlow, nextRound]);

  // ── Auto-play effect ──────────────────────────────────────────────
  useEffect(() => {
    if (!autoPlay) return;

    if (step === "idle") {
      const timer = setTimeout(() => runFlow(), 500);
      return () => clearTimeout(timer);
    }

    if (step === "done") {
      const timer = setTimeout(() => nextRound(), 1500);
      return () => clearTimeout(timer);
    }
  }, [step, autoPlay, runFlow, nextRound]);

  // ── Derived state ─────────────────────────────────────────────────
  const isGenerating = step === "generating";
  const showResults = step === "results" || step === "done";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-8 overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Round indicator */}
        <div className="flex justify-center mb-4">
          <div className="flex gap-2">
            {ROUNDS.map((round, index) => (
              <div
                key={round.id}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-300",
                  index === currentRound % ROUNDS.length
                    ? "bg-primary"
                    : "bg-gray-300",
                )}
              />
            ))}
          </div>
        </div>

        {/* Brand header */}
        <div className="flex justify-center mb-8 sm:mb-12 min-h-[56px]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Image
              src={brand.logo.svgPath}
              alt={brand.logo.alt}
              width={200}
              height={80}
              className="h-12 sm:h-14 w-auto"
              priority
            />
          </motion.div>
        </div>

        {/* Input area */}
        <div className="flex justify-center min-h-[64px] sm:min-h-[72px]">
          <div className="w-full max-w-3xl">
            <motion.div
              className="relative flex items-center w-full h-14 sm:h-16 pl-4 sm:pl-6 pr-2 py-0 rounded-full border-2 border-primary transition-all duration-300"
              animate={{
                boxShadow: isGenerating
                  ? "0 8px 40px rgba(6,182,212,0.45)"
                  : "0 4px 30px rgba(6,182,212,0.25)",
              }}
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(16px) saturate(1.5)",
              }}
            >
              {/* Prompt display */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <span className="text-sm sm:text-base text-gray-900 whitespace-nowrap">
                  {displayedPrompt}
                </span>
                {/* Blinking cursor during typing */}
                {step === "typing" && (
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                )}
              </div>

              {/* Generate button */}
              <button
                type="button"
                className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full bg-primary text-white font-medium text-sm sm:text-base shadow-lg whitespace-nowrap flex-shrink-0"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="w-4 h-4 flex-shrink-0" />
                    </motion.div>
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Create</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="min-h-[32px] mt-4 flex items-center justify-center">
          {isGenerating && (
            <motion.div
              className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        {/* Results area */}
        <div className="min-h-[280px] sm:min-h-[320px] md:min-h-[360px] mt-6">
          <motion.div
            className={cn(
              "transition-opacity duration-500",
              showResults ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
            initial={false}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto px-4">
              {EXPRESSION_LABELS.map((expr, index) => (
                <motion.div
                  key={expr.key}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden shadow-md transition-transform duration-300",
                    showResults ? "scale-100" : "scale-95",
                  )}
                  style={{
                    transitionDelay: showResults ? `${index * 100}ms` : "0ms",
                  }}
                >
                  <Image
                    src={round.expressions[expr.key]}
                    alt={expr.label}
                    fill
                    className="object-cover"
                  />
                  {/* Label overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <span className="text-white text-xs font-medium">
                      {expr.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
