export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-screen-xl mx-auto px-4 py-20 sm:py-32">
        <div className="text-center max-w-6xl mx-auto">
          {/* Overline */}
          <div className="text-sm text-[#FFFFFF80] uppercase tracking-wide mb-6">
            FROM IDEA TO THUMBNAIL IN 30 SECONDS
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-white font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Free Your Thumbnails. Grow Your Channel.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[#FFFFFF80] max-w-5xl mx-auto mb-8">
            Enter your video title, upload your photo, and let Thumb-Free handle
            the rest. Pro-level branding for creators who value their time.
          </p>
        </div>
      </div>
    </section>
  );
}
