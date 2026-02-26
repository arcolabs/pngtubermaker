"use client";

import {
  Crown,
  ImageIcon,
  Lock,
  Mic,
  Monitor,
  Sparkles,
  Wand2,
} from "lucide-react";
import Link from "next/link";

const LOCKED_FEATURES = [
  { icon: Wand2, label: "Expression Packs", desc: "Happy, angry, sad & more" },
  { icon: ImageIcon, label: "HD Export (1080p)", desc: "Crisp on any screen" },
  { icon: Sparkles, label: "Animation", desc: "Blinking & mouth movement" },
  { icon: Mic, label: "OBS Lip Sync", desc: "Real-time mic reactivity" },
];

export function TrialResultUpsell() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-cyan-50 p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-gray-900">
          Ready to bring your avatar to life?
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Your free avatar is ready at 512px. Unlock everything to go live on
        stream:
      </p>

      {/* Locked feature grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {LOCKED_FEATURES.map((feat) => (
          <div
            key={feat.label}
            className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200/60"
          >
            <div className="relative mt-0.5">
              <feat.icon className="w-5 h-5 text-gray-400" />
              <Lock className="w-3 h-3 text-gray-400 absolute -bottom-1 -right-1" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700">{feat.label}</p>
              <p className="text-xs text-gray-400">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/pricing"
          className="btn border-0 text-white bg-gradient-to-r from-primary to-cyan-400 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] flex-1"
        >
          <Crown className="w-4 h-4" />
          Get Creator Pass — $7.99/mo
        </Link>
        <Link href="/pricing" className="btn btn-outline btn-primary flex-1">
          Buy Credits
        </Link>
      </div>
    </div>
  );
}
