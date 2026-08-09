"use client";

export function UserCountBadge() {
  return (
    <div className="mb-6 inline-flex items-center justify-center">
      <div className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm tracking-wide shadow-sm">
        {/* Sparkle icon */}
        <span className="text-amber-500">✨</span>
        <span className="font-medium text-gray-700">
          Create your first avatar free — no credit card needed
        </span>
      </div>
    </div>
  );
}
