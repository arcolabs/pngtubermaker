"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import type { ArtStyle, AspectRatio } from "@/hooks/use-avatar-generator";
import { TASK_COSTS } from "@/lib/services/credits";
import type { ReferenceHandlers } from "@/types/reference";
import { ReferenceModule } from "./ReferenceModule";
import { ReferenceUploadArea } from "./ReferenceUploadArea";

const CHARACTER_COST = TASK_COSTS.avatar_generation;

// ── Prompt Builder Tags ──────────────────────────────────────────────────────

interface TagCategory {
  label: string;
  options: { id: string; text: string }[];
}

const TAG_CATEGORIES: TagCategory[] = [
  {
    label: "Role",
    options: [
      { id: "gamer", text: "Gamer" },
      { id: "musician", text: "Musician" },
      { id: "artist", text: "Artist" },
      { id: "vtuber", text: "VTuber" },
      { id: "just-chatting", text: "Just Chatting" },
      { id: "tech", text: "Tech" },
    ],
  },
  {
    label: "Character",
    options: [
      { id: "girl", text: "Girl" },
      { id: "boy", text: "Boy" },
      { id: "furry", text: "Furry" },
      { id: "demon", text: "Demon" },
      { id: "angel", text: "Angel" },
      { id: "android", text: "Android" },
    ],
  },
  {
    label: "Personality",
    options: [
      { id: "chill", text: "Chill" },
      { id: "energetic", text: "Energetic" },
      { id: "wholesome", text: "Wholesome" },
      { id: "mysterious", text: "Mysterious" },
      { id: "comedic", text: "Comedic" },
      { id: "professional", text: "Professional" },
    ],
  },
  {
    label: "Style",
    options: [
      { id: "modern-vtuber", text: "Modern VTuber" },
      { id: "retro-anime", text: "Retro Anime" },
      { id: "semi-realistic", text: "Semi-Realistic" },
      { id: "pixel-art", text: "Pixel Art" },
      { id: "chibi-style", text: "Chibi Style" },
    ],
  },
  {
    label: "Signature",
    options: [
      { id: "headset", text: "Gaming Headset" },
      { id: "microphone", text: "Microphone" },
      { id: "hoodie", text: "Hoodie" },
      { id: "glasses", text: "Glasses" },
      { id: "horns", text: "Horns" },
      { id: "wings", text: "Wings" },
    ],
  },
];

const QUICK_TEMPLATES = [
  "A chill gamer girl, modern VTuber style, with gaming headset and RGB lighting",
  "An energetic musician boy with headphones around neck, holding a guitar, retro anime style",
  "A wholesome VTuber angel with wings and halo, streaming setup background",
  "A mysterious tech android with glowing eyes and holographic interface elements",
  "A comedic furry character, energetic personality, modern VTuber style",
  "A professional artist with drawing tablet, cozy streaming setup, chill vibes",
];

function buildPromptFromTags(selections: Record<string, string>): string {
  const parts: string[] = [];
  const role = selections.Role;
  const character = selections.Character;
  const personality = selections.Personality;
  const style = selections.Style;
  const signature = selections.Signature;

  // Build subject description
  const subjectParts: string[] = [];

  if (personality) {
    subjectParts.push(personality.toLowerCase());
  }

  if (role) {
    subjectParts.push(role.toLowerCase());
  }

  if (character) {
    subjectParts.push(character.toLowerCase());
  }

  if (subjectParts.length > 0) {
    parts.push(`A ${subjectParts.join(" ")}`);
  }

  // Add style as art direction
  if (style) {
    parts.push(`in ${style.toLowerCase()} style`);
  }

  // Add signature elements
  if (signature) {
    parts.push(`with ${signature.toLowerCase()}`);
  }

  return parts.join(", ");
}

interface GeneratorFormProps {
  prompt: string;
  style: ArtStyle;
  aspectRatio: AspectRatio;
  creditBalance: number | null;
  isGenerating: boolean;
  reference: ReferenceHandlers;
  onPromptChange: (prompt: string) => void;
  onStyleChange: (style: ArtStyle) => void;
  onAspectRatioChange: (aspectRatio: AspectRatio) => void;
  onGenerate: () => void;
}

// Aspect Ratio Visual Icons - Linear Minimal Style
function AspectRatioIcon({
  ratio,
  isActive,
}: {
  ratio: AspectRatio;
  isActive: boolean;
}) {
  const baseClasses = "border transition-all duration-150";
  const activeClasses = isActive
    ? "border-primary bg-primary"
    : "border-gray-300 bg-transparent";

  switch (ratio) {
    case "1:1":
      return (
        <div
          className={`${baseClasses} ${activeClasses} w-4 h-4 rounded-[3px]`}
        />
      );
    case "3:4":
      return (
        <div
          className={`${baseClasses} ${activeClasses} w-3 h-4 rounded-[3px]`}
        />
      );
    case "9:16":
      return (
        <div
          className={`${baseClasses} ${activeClasses} w-2 h-4 rounded-[3px]`}
        />
      );
    default:
      return null;
  }
}

const ASPECT_RATIO_OPTIONS: {
  id: AspectRatio;
  label: string;
  description: string;
}[] = [
  { id: "1:1", label: "1:1", description: "Square" },
  { id: "3:4", label: "3:4", description: "Portrait" },
  { id: "9:16", label: "9:16", description: "Story" },
];

const STYLE_OPTIONS: { id: ArtStyle; label: string; icon: string }[] = [
  { id: "anime", label: "Anime", icon: "🎨" },
  { id: "chibi", label: "Chibi", icon: "🎀" },
];

export function GeneratorForm({
  prompt,
  style,
  aspectRatio,
  creditBalance,
  isGenerating,
  reference,
  onPromptChange,
  onStyleChange,
  onAspectRatioChange,
  onGenerate,
}: GeneratorFormProps) {
  const textareaRef = useAutoResizeTextarea(prompt, {
    minHeight: 80,
    maxHeight: 160,
  });

  // Tag selection state: { "Character": "Girl", "Vibe": "Cute", ... }
  const [tagSelections, setTagSelections] = useState<Record<string, string>>(
    {},
  );
  const [showBuilder, setShowBuilder] = useState(true);

  // Use ref to avoid effect dependency issues
  const onPromptChangeRef = useRef(onPromptChange);
  onPromptChangeRef.current = onPromptChange;
  const promptRef = useRef(prompt);
  promptRef.current = prompt;

  useEffect(() => {
    const built = buildPromptFromTags(tagSelections);
    // Only update if user has selected tags and prompt differs
    if (Object.keys(tagSelections).length > 0 && built !== promptRef.current) {
      onPromptChangeRef.current(built);
    }
  }, [tagSelections]);

  const handleTagClick = useCallback(
    (categoryLabel: string, optionText: string) => {
      setTagSelections((prev) => {
        const next = { ...prev };
        // Toggle: clicking same tag deselects
        if (next[categoryLabel] === optionText) {
          delete next[categoryLabel];
        } else {
          next[categoryLabel] = optionText;
        }
        return next;
      });
    },
    [],
  );

  const handleTemplateClick = useCallback(
    (template: string) => {
      setTagSelections({});
      onPromptChange(template);
    },
    [onPromptChange],
  );

  const canSubmit =
    prompt.trim().length >= 10 &&
    !isGenerating &&
    (creditBalance ?? 0) >= CHARACTER_COST;
  const insufficientCredits =
    creditBalance !== null && creditBalance < CHARACTER_COST;

  const hasAnyTag = Object.keys(tagSelections).length > 0;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="space-y-4">
        {/* Quick Start Builder */}
        {showBuilder && !isGenerating && (
          <div className="bg-gray-50/50 rounded-xl border border-gray-200/60 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Quick Start
                </span>
                <span className="text-xs text-gray-400">
                  — Click tags to build your prompt
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-200/50"
              >
                Hide
              </button>
            </div>

            {/* Tag Categories - Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TAG_CATEGORIES.map((cat) => (
                <div
                  key={cat.label}
                  className="bg-white rounded-lg border border-gray-200/60 p-3"
                >
                  <span className="text-xs font-medium text-gray-400 block mb-2">
                    {cat.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.options.map((opt) => {
                      const isSelected = tagSelections[cat.label] === opt.text;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleTagClick(cat.label, opt.text)}
                          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 border ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Templates */}
            {!hasAnyTag && (
              <div className="mt-4 pt-4 border-t border-gray-200/60">
                <span className="text-xs font-medium text-gray-400 block mb-2">
                  Quick Templates
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_TEMPLATES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTemplateClick(t)}
                      className="text-left px-3 py-2.5 rounded-lg text-xs text-gray-600 bg-white border border-gray-200/60 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-150 line-clamp-2 leading-relaxed"
                      title={t}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show builder toggle when hidden */}
        {!showBuilder && !isGenerating && (
          <button
            type="button"
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20"
          >
            <span>Quick Start</span>
            <span className="text-gray-400">— Build your prompt</span>
          </button>
        )}

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

        {/* Controls Row - Linear Design */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
          {/* Style Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Style
            </span>
            <div className="flex gap-1">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onStyleChange(s.id)}
                  disabled={isGenerating}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                    transition-all duration-150 ease-out
                    ${
                      style === s.id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200/80"
                    }
                    active:scale-[0.97]
                    disabled:opacity-40 disabled:cursor-not-allowed
                  `}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-gray-200/60" />

          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Ratio
            </span>
            <div className="flex gap-1">
              {ASPECT_RATIO_OPTIONS.map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => onAspectRatioChange(ar.id)}
                  disabled={isGenerating}
                  title={`${ar.description} (${ar.label})`}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150
                    ${
                      aspectRatio === ar.id
                        ? "bg-primary/10 border border-primary text-primary"
                        : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                    }
                    active:scale-[0.97]
                    disabled:opacity-40
                  `}
                >
                  <AspectRatioIcon
                    ratio={ar.id}
                    isActive={aspectRatio === ar.id}
                  />
                  <span className="text-xs font-medium">{ar.label}</span>
                </button>
              ))}
            </div>
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
                Generate
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
