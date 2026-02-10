export default function YouTubeThumbnailGrabberHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 sm:pt-32 sm:pb-6">
        <div className="text-center max-w-6xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#FF5555]"
              aria-hidden="true"
            >
              <path
                d="M8 0L10.472 5.528L16 8L10.472 10.472L8 16L5.528 10.472L0 8L5.528 5.528L8 0Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm text-[#FFFFFF80] font-medium tracking-wide">
              YouTube Thumbnail Grabber
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-white font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight max-w-7xl mx-auto">
            Every YouTube thumbnail,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "radial-gradient(at 50% 0%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)",
              }}
            >
              one simple tool
            </span>
            .
          </h1>

          {/* Descriptive Text */}
          <p className="text-base sm:text-lg text-[#FFFFFF80] max-w-3xl mx-auto leading-relaxed">
            Access and download thumbnails from any YouTube video instantly.
            Fast, free, and easy to use for creators and developers.
          </p>

          {/* Quick Benefits */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { id: "instant", icon: "⚡", text: "Instant Download" },
              { id: "login", icon: "🔓", text: "No Login Required" },
              { id: "unlimited", icon: "∞", text: "Unlimited Grabs" },
            ].map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/80 bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
