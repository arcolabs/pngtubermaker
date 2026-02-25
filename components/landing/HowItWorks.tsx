import type { LandingStep } from "@/lib/landing-pages";

export default function HowItWorks({
  title,
  items,
}: {
  title: string;
  items: LandingStep[];
}) {
  return (
    <section className="py-16 sm:py-20 bg-base-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-12 sm:mb-16">
          {title}
        </h2>

        <div className="space-y-8 sm:space-y-10">
          {items.map((step, i) => (
            <div key={step.title} className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 flex items-start justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary font-bold text-lg sm:text-xl">
                <span className="mt-1.5 sm:mt-2">{i + 1}</span>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
