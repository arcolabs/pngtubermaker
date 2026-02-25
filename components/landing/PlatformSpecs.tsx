import { Info } from "lucide-react";
import type { LandingPlatformSpecs } from "@/lib/landing-pages";

export default function PlatformSpecs({
  specs,
}: {
  specs: LandingPlatformSpecs;
}) {
  return (
    <section className="py-16 sm:py-20 bg-base-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-10 sm:mb-12">
          {specs.title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {specs.items.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-5 rounded-xl border border-base-300 bg-white"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                <p className="text-gray-600 text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
