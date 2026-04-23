import Image from "next/image";

export default function ReferenceSheetSection() {
  return (
    <section className="py-16 sm:py-24 bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            The character sheet your artist charges{" "}
            <span className="text-primary">hundreds</span> for.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            Three views, expression sheet, color palette, world-setting —
            generated in seconds from your avatar.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-[0_8px_40px_rgba(6,182,212,0.15)]">
            <Image
              src="/images/reference-sheet/showcase.png"
              alt="AI-generated character reference sheet showing three-view turnaround, expression variations, color palette, and world setting"
              width={1024}
              height={1024}
              className="w-full h-auto"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
