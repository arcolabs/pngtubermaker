"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Create your first PNGTuber</h3>
      <p className="text-base-content/60 max-w-md mx-auto mb-6">
        Describe your character and we&apos;ll generate a complete expression
        pack in minutes
      </p>
      <Link href="/create" className="btn btn-primary gap-2">
        <Sparkles className="w-4 h-4" />
        Create PNGTuber
      </Link>
    </div>
  );
}
