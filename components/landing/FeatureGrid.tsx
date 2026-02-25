import {
  Download,
  Gift,
  Image,
  Layers,
  Mic,
  Monitor,
  Palette,
  Shield,
  Smile,
  Sparkles,
  User,
  Users,
  Video,
  Wand2,
  Zap,
} from "lucide-react";
import type { LandingFeature } from "@/lib/landing-pages";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Download,
  Gift,
  Image,
  Layers,
  Mic,
  Monitor,
  Palette,
  Shield,
  Smile,
  Sparkles,
  User,
  Users,
  Video,
  Wand2,
  Zap,
};

export default function FeatureGrid({
  title,
  items,
}: {
  title: string;
  items: LandingFeature[];
}) {
  return (
    <section className="py-16 sm:py-20 bg-base-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-12 sm:mb-16">
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {items.map((feature) => {
            const Icon = ICON_MAP[feature.icon];
            return (
              <div
                key={feature.title}
                className="p-6 lg:p-8 rounded-xl border border-base-300 bg-white hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {Icon && (
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
