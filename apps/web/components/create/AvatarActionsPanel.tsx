"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import type { SelectedAvatar } from "@/hooks/use-avatar-generator";

interface AvatarActionsPanelProps {
  selected: SelectedAvatar;
  onSubmitPrompt?: (prompt: string) => void;
}

export function AvatarActionsPanel({
  onSubmitPrompt,
}: AvatarActionsPanelProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSubmitPrompt) {
      onSubmitPrompt(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && onSubmitPrompt) {
        onSubmitPrompt(inputValue.trim());
        setInputValue("");
      }
    }
  };

  return (
    <div
      className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/60"
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask to modify this avatar..."
          rows={3}
          className="w-full px-4 py-3 pr-12 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
