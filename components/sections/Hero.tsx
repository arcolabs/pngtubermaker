import { UserCountBadge } from "@/components/ui/UserCountBadge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8">
        <div className="text-center max-w-6xl mx-auto">
          <UserCountBadge />

          {/* Main Heading */}
          <h1 className="mb-4 text-white font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Free Your Thumbnails. Grow Your Channel.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[#FFFFFF80] max-w-5xl mx-auto">
            Enter your video title, upload your photo, and let Thumb-Free handle
            the rest. Pro-level branding for creators who value their time.
          </p>
        </div>
      </div>
    </section>
  );
}
