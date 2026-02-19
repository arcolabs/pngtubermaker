"use client";

import { Loader2, Sparkles } from "lucide-react";
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

const EXPRESSION_COST = TASK_COSTS.expression_edit * 3; // 3 expressions (talking, happy, sad)
const CHARACTER_COST = TASK_COSTS.avatar_generation;
const TOTAL_COST = CHARACTER_COST + EXPRESSION_COST;

export function StepDescribe({
  prompt,
  style,
  creditBalance,
  isGenerating,
  onPromptChange,
  onStyleChange,
  onSubmit,
}: StepDescribeProps) {
  const canSubmit =
    prompt.trim().length >= 10 &&
    !isGenerating &&
    (creditBalance ?? 0) >= CHARACTER_COST;
  const insufficientCredits =
    creditBalance !== null && creditBalance < CHARACTER_COST;

  return (
    <div className="space-y-6">
      {/* Prompt input */}
      <div className="form-control">
        <label className="label" htmlFor="prompt-input">
          <span className="label-text font-medium">
            Describe your character
          </span>
        </label>
        <textarea
          id="prompt-input"
          className="textarea textarea-bordered w-full min-h-[120px] text-base"
          placeholder="A cute anime girl with long silver hair, blue eyes, wearing a purple hoodie with cat ears on the hood..."
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

      {/* Style selector */}
      <div className="form-control">
        <div className="label">
          <span className="label-text font-medium">Art Style</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onStyleChange("anime")}
            className={`card bg-base-200 p-6 text-center cursor-pointer transition-all ${
              style === "anime"
                ? "ring-2 ring-primary shadow-lg"
                : "hover:shadow-md"
            }`}
          >
            <span className="text-3xl mb-2">🎨</span>
            <span className="font-semibold">Anime</span>
            <span className="text-sm text-base-content/60">
              Clean modern anime style
            </span>
          </button>
          <button
            type="button"
            onClick={() => onStyleChange("chibi")}
            className={`card bg-base-200 p-6 text-center cursor-pointer transition-all ${
              style === "chibi"
                ? "ring-2 ring-primary shadow-lg"
                : "hover:shadow-md"
            }`}
          >
            <span className="text-3xl mb-2">🎀</span>
            <span className="font-semibold">Chibi</span>
            <span className="text-sm text-base-content/60">
              Super-deformed cute style
            </span>
          </button>
        </div>
      </div>

      {/* Cost preview */}
      <div className="bg-base-200 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Character generation</span>
          <span>{CHARACTER_COST} credits</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Expression pack (3 expressions)</span>
          <span>{EXPRESSION_COST} credits</span>
        </div>
        <div className="divider my-1" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{TOTAL_COST} credits</span>
        </div>
        <div className="flex justify-between text-xs text-base-content/50">
          <span>Your balance</span>
          <span>
            {creditBalance !== null ? `${creditBalance} credits` : "Loading..."}
          </span>
        </div>
      </div>

      {/* Insufficient credits warning */}
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

      {/* Submit button */}
      <button
        type="button"
        className="btn btn-primary w-full"
        disabled={!canSubmit}
        onClick={onSubmit}
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
