"use client";

import { Cloud, Code, Database, Palette, Shield, Zap } from "lucide-react";
import { memo } from "react";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY_FEATURES: FeatureCard[] = [
  {
    id: "modern-stack",
    title: "Modern Tech Stack",
    description:
      "Built with Next.js 16, React 19, and Tailwind CSS v4. Stay up to date with the latest web technologies.",
    icon: Zap,
  },
  {
    id: "auth-ready",
    title: "Authentication Ready",
    description:
      "Complete authentication system with better-auth. Email/password and OAuth providers included.",
    icon: Shield,
  },
];

const SECONDARY_FEATURES: FeatureCard[] = [
  {
    id: "database",
    title: "Database Integration",
    description:
      "Neon PostgreSQL with Drizzle ORM. Type-safe queries and serverless scaling.",
    icon: Database,
  },
  {
    id: "storage",
    title: "Cloud Storage",
    description:
      "R2-compatible object storage for media files with presigned URLs.",
    icon: Cloud,
  },
  {
    id: "typesafe",
    title: "Type Safe",
    description:
      "Full TypeScript support. Type-safe database queries and API routes.",
    icon: Code,
  },
  {
    id: "styling",
    title: "Modern Styling",
    description: "Tailwind CSS v4 with daisyUI. Dark mode ready design system.",
    icon: Palette,
  },
];

const FeatureCardComponent = memo(function FeatureCardComponent({
  feature,
  variant = "default",
  index,
}: {
  feature: FeatureCard;
  variant?: "default" | "compact";
  index: number;
}) {
  const isCompact = variant === "compact";
  const Icon = feature.icon;

  return (
    <div className="card border border-base-content/10 hover:border-primary/40 transition-colors">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div
            className={`badge badge-primary badge-outline ${
              isCompact ? "badge-sm" : ""
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>

        <div
          className={`mt-2 ${
            isCompact ? "w-10 h-10" : "w-12 h-12"
          } rounded-lg bg-primary/10 flex items-center justify-center`}
        >
          <Icon
            className={`${isCompact ? "w-5 h-5" : "w-6 h-6"} text-primary`}
          />
        </div>

        <h3
          className={`card-title text-base-content ${
            isCompact ? "text-lg" : "text-xl"
          }`}
        >
          {feature.title}
        </h3>
        <p className="text-base-content/60 text-sm">{feature.description}</p>
      </div>
    </div>
  );
});

export default function Features() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-base-content mb-6">
            Everything You Need
          </h2>

          <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
            A complete starter template with production-ready features. Focus on
            building your product, not the infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {PRIMARY_FEATURES.map((feature, index) => (
            <FeatureCardComponent
              key={feature.id}
              feature={feature}
              variant="default"
              index={index}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECONDARY_FEATURES.map((feature, index) => (
            <FeatureCardComponent
              key={feature.id}
              feature={feature}
              variant="compact"
              index={index + 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
