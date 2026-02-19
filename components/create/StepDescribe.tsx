"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import type { ArtStyle } from "@/hooks/use-generation";
import { TASK_COSTS } from "@/lib/services/credits";

interface StepDescribeProps {
  prompt: string;
  style: ArtStyle;
  creditBalance: number | null;
  isGenerating: boolean;
  onPromptChange: (prompt: string) => void;
  onStyleChange: (style: ArtStyle) => void;
  onSubmit: () => void;
}

const EXPRESSION_COST = TASK_COSTS.expression_edit * 3;
const CHARACTER_COST = TASK_COSTS.avatar_generation;
const TOTAL_COST = CHARACTER_COST + EXPRESSION_COST;

const STYLE_OPTIONS = [
  {
    id: "anime" as ArtStyle,
    label: "Anime",
    desc: "Clean modern anime style",
    icon: "🎨",
  },
  {
    id: "chibi" as ArtStyle,
    label: "Chibi",
    desc: "Super-deformed cute style",
    icon: "🎀",
  },
];

export function StepDescribe({
  prompt,
  style,
  creditBalance,
  isGenerating,
  onPromptChange,
  onStyleChange,
  onSubmit,
}: StepDescribeProps) {
  const textareaRef = useAutoResizeTextarea(prompt, {
    minHeight: 120,
    maxHeight: 240,
  });

  const canSubmit =
    prompt.trim().length >= 10 &&
    !isGenerating &&
    (creditBalance ?? 0) >= CHARACTER_COST;
  const insufficientCredits =
    creditBalance !== null && creditBalance < CHARACTER_COST;

  return (
    <div className="space-y-6">
      <div className="form-control">
        <label className="label" htmlFor="prompt-input">
          <span className="label-text font-medium">
            Describe your character
          </span>
        </label>
        <textarea
          ref={textareaRef}
          id="prompt-input"
          className="textarea w-full border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-base resize-none transition-all duration-200"
          placeholder="A cute anime girl with long silver hair, blue eyes, wearing a purple hoodie with cat ears..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={isGenerating}
          maxLength={1000}
        />
        <div className="label">
          <span className="label-text-alt">{prompt.length}/1000</span>
          {prompt.trim().length > 0 && prompt.trim().length < 10 && (
            <span className="label-text-alt text-warning">
              At least 10 characters
            </span>
          )}
        </div>
      </div>

      <div className="form-control">
        <div className="label">
          <span className="label-text font-medium">Art Style</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {STYLE_OPTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStyleChange(s.id)}
              className={`group relative p-5 rounded-xl text-left transition-all duration-200 ${
                style === s.id
                  ? "bg-primary/5 border-2 border-primary shadow-[0_0_0_3px_rgba(6,182,212,0.1)]"
                  : "bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <span className="text-2xl block mb-2">{s.icon}</span>
              <span className="font-semibold text-gray-900 block">
                {s.label}
              </span>
              <span className="text-sm text-gray-500">{s.desc}</span>
              {style === s.id && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Character generation</span>
          <span className="text-gray-900">{CHARACTER_COST} credits</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Expression pack (3 expressions)</span>
          <span className="text-gray-900">{EXPRESSION_COST} credits</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-primary">{TOTAL_COST} credits</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Your balance</span>
          <span>
            {creditBalance !== null
              ? `${creditBalance.toLocaleString()} credits`
              : "Loading..."}
          </span>
        </div>
      </div>

      {insufficientCredits && (
        <div className="alert alert-warning">
          <span>
            Not enough credits.{" "}
            <a href="/pricing" className="link link-primary">
              Get more credits
            </a>
          </span>
        </div>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
        className="btn w-full border-0 text-white text-base h-12 bg-gradient-to-r from-primary to-cyan-400 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:scale-100 transition-all duration-200"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Character — {CHARACTER_COST} credits
          </>
        )}
      </button>
    </div>
  );
}
