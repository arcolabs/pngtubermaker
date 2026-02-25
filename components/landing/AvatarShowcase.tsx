import Image from "next/image";
import type { LandingShowcase } from "@/lib/landing-pages";

export default function AvatarShowcase({
  showcase,
}: {
  showcase: LandingShowcase;
}) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">
          {showcase.title}
        </h2>
        {showcase.description && (
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            {showcase.description}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {showcase.images.map((img) => (
            <div
              key={img.src}
              className="relative aspect-square rounded-xl overflow-hidden border border-base-300 bg-base-200 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
