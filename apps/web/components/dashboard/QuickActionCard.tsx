"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

interface QuickActionCardProps {
  loading?: boolean;
}

export default function QuickActionCard({
  loading = false,
}: QuickActionCardProps) {
  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] animate-pulse">
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-10 w-28 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/create"
      className="group block bg-gradient-to-r from-primary/5 via-cyan-400/5 to-primary/5 border border-primary/10 rounded-2xl p-5 sm:p-6 hover:shadow-[0_4px_30px_rgba(6,182,212,0.15)] hover:border-primary/20 transition-all duration-200"
    >
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-gray-900 text-lg">
            Create PNGTuber
          </h3>
          <p className="text-sm text-gray-500">
            Generate a new avatar with expressions
          </p>
        </div>
        <span className="btn btn-sm border-0 text-white bg-gradient-to-r from-primary to-cyan-400 ml-auto hidden sm:inline-flex">
          Get Started
        </span>
      </div>
    </Link>
  );
}
