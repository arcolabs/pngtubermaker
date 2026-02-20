"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import type { ArtStyle } from "@/hooks/use-avatar-generator";
import { TASK_COSTS } from "@/lib/services/credits";
import type { ReferenceHandlers } from "@/types/reference";
import { ReferenceModule } from "./ReferenceModule";
import { ReferenceUploadArea } from "./ReferenceUploadArea";

interface GeneratorFormProps {
  prompt: string;
  style: ArtStyle;
  creditBalance: number | null;
  isGenerating: boolean;
  reference: ReferenceHandlers;
  onPromptChange: (prompt: string) => void;
  onStyleChange: (style: ArtStyle) => void;
  onGenerate: () => void;
}

const CHARACTER_COST = TASK_COSTS.avatar_generation;

const STYLE_OPTIONS: { id: ArtStyle; label: string; icon: string }[] = [
  { id: "anime", label: "Anime", icon: "🎨" },
  { id: "chibi", label: "Chibi", icon: "🎀" },
];

export function GeneratorForm({
  prompt,
  style,
  creditBalance,
  isGenerating,
  reference,
  onPromptChange,
  onStyleChange,
  onGenerate,
}: GeneratorFormProps) {
  const textareaRef = useAutoResizeTextarea(prompt, {
    minHeight: 80,
    maxHeight: 160,
  });

  const canSubmit =
    prompt.trim().length >= 10 &&
    !isGenerating &&
    (creditBalance ?? 0) >= CHARACTER_COST;
  const insufficientCredits =
    creditBalance !== null && creditBalance < CHARACTER_COST;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="space-y-4">
        {/* Prompt */}
        <div className="form-control">
          <textarea
            ref={textareaRef}
            className="textarea w-full border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-base resize-none transition-all duration-200"
            placeholder="A cute anime girl with long silver hair, blue eyes, wearing a purple hoodie with cat ears..."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={isGenerating}
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className="text-xs text-gray-400">{prompt.length}/1000</span>
            {prompt.trim().length > 0 && prompt.trim().length < 10 && (
              <span className="text-xs text-warning">
                At least 10 characters
              </span>
            )}
          </div>
        </div>

        {/* Reference Modules */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Reference Images (Optional)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ReferenceModule
              type="image"
              file={reference.imageFile}
              isActive={reference.activeType === "image"}
              onClick={() =>
                reference.onActiveTypeChange(
                  reference.activeType === "image" ? null : "image",
                )
              }
              onRemoveFile={() => reference.onImageFileChange(null)}
              disabled={isGenerating}
            />
            <ReferenceModule
              type="style"
              file={reference.styleFile}
              isActive={reference.activeType === "style"}
              onClick={() =>
                reference.onActiveTypeChange(
                  reference.activeType === "style" ? null : "style",
                )
              }
              onRemoveFile={() => reference.onStyleFileChange(null)}
              disabled={isGenerating}
            />
            <ReferenceModule
              type="face"
              file={reference.faceFile}
              isActive={reference.activeType === "face"}
              onClick={() =>
                reference.onActiveTypeChange(
                  reference.activeType === "face" ? null : "face",
                )
              }
              onRemoveFile={() => reference.onFaceFileChange(null)}
              disabled={isGenerating}
            />
          </div>

          {/* Upload Area */}
          <ReferenceUploadArea
            activeType={reference.activeType}
            gallery={reference.gallery}
            onImageUploaded={(file) => {
              reference.onImageUploaded(file);
              // Auto-assign to active module if it doesn't have a file yet
              if (reference.activeType === "image" && !reference.imageFile) {
                reference.onImageFileChange(file);
              } else if (
                reference.activeType === "style" &&
                !reference.styleFile
              ) {
                reference.onStyleFileChange(file);
              } else if (
                reference.activeType === "face" &&
                !reference.faceFile
              ) {
                reference.onFaceFileChange(file);
              }
            }}
            onRemoveFromGallery={reference.onRemoveFromGallery}
            disabled={isGenerating}
          />
        </div>

        {/* Style + Balance + Generate row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Style pills */}
          <div className="flex gap-2">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onStyleChange(s.id)}
                disabled={isGenerating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  style === s.id
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
                {style === s.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Balance */}
          <div className="text-xs text-gray-400 whitespace-nowrap">
            {creditBalance !== null
              ? `${creditBalance.toLocaleString()} credits`
              : "Loading..."}
          </div>

          {/* Generate button */}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onGenerate}
            className="btn border-0 text-white bg-gradient-to-r from-primary to-cyan-400 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:scale-100 transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate — {CHARACTER_COST} cr
              </>
            )}
          </button>
        </div>

        {insufficientCredits && (
          <div className="alert alert-warning py-2 text-sm">
            <span>
              Not enough credits.{" "}
              <a href="/pricing" className="link link-primary">
                Get more credits
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
