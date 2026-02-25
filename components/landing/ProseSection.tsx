import type { LandingProse } from "@/lib/landing-pages";

export default function ProseSection({ prose }: { prose: LandingProse }) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-10 sm:mb-12">
          {prose.title}
        </h2>

        <div className="space-y-8 sm:space-y-10">
          {prose.blocks.map((block) => (
            <div key={block.subtitle ?? block.text.slice(0, 40)}>
              {block.subtitle && (
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {block.subtitle}
                </h3>
              )}
              <p className="text-gray-600 leading-relaxed">{block.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
