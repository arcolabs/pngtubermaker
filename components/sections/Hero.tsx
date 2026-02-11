import { UserCountBadge } from "@/components/ui/UserCountBadge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-6 sm:pb-8">
        <div className="text-center max-w-6xl mx-auto">
          <UserCountBadge />

          {/* Main Heading */}
          <h1 className="mb-3 sm:mb-4 text-white font-bold text-2xl sm:text-4xl lg:text-6xl leading-tight px-2 sm:px-0">
            Free Your Thumbnails.
            <br className="sm:hidden" /> Grow Your Channel.
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base lg:text-lg text-[#FFFFFF80] max-w-5xl mx-auto px-4 sm:px-0">
            Enter your video title, upload your photo, and let Thumb-Free handle
            the rest. Pro-level branding for creators who value their time.
          </p>
        </div>
      </div>
    </section>
  );
}
