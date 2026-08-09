"use client";

import { ImageIcon, MessageSquare, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: MessageSquare,
    title: "Describe",
    description: "Tell us about your character",
  },
  {
    icon: Wand2,
    title: "Generate",
    description: "AI creates your avatar",
  },
  {
    icon: ImageIcon,
    title: "Download",
    description: "Get your expression pack",
  },
];

const examples = [
  "A cute fox girl with pink hair and headphones",
  "A cool robot character with glowing blue eyes",
  "A friendly dragon with pastel colors",
];

export default function EmptyState() {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-cyan-400/10 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Create your first PNGTuber
          </h3>
          <p className="text-gray-500 mb-8 max-w-md">
            Transform your ideas into professional avatars with AI. Generate
            expressions, animations, and export in HD quality.
          </p>

          <Link href="/create" className="btn btn-primary gap-2 w-fit">
            <Sparkles className="w-4 h-4" />
            Start Creating
          </Link>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50/80 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
              How it works
            </h4>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex-shrink-0">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">
                        Step {index + 1}
                      </span>
                      <h5 className="font-medium text-gray-900">
                        {step.title}
                      </h5>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-cyan-400/5 rounded-xl p-6 border border-primary/10">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Try these examples
            </h4>
            <div className="space-y-2">
              {examples.map((example) => (
                <Link
                  key={example}
                  href={`/create?prompt=${encodeURIComponent(example)}`}
                  className="block p-3 bg-white rounded-lg text-sm text-gray-600 hover:text-primary hover:shadow-sm transition-all border border-gray-100 hover:border-primary/20"
                >
                  "{example}"
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
