export default function YouTubeThumbnailGrabberHero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 sm:pt-32 sm:pb-6">
        <div className="text-center max-w-6xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
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
            <span className="text-sm text-[#FFFFFF80] font-medium">
              YouTube Thumbnail Grabber
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-white font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight max-w-7xl mx-auto">
            Every YouTube thumbnail, one simple tool.
          </h1>

          {/* Descriptive Text */}
          <p className="text-base sm:text-lg text-[#FFFFFF80] max-w-6xl mx-auto leading-relaxed">
            Access and download thumbnails from any YouTube video instantly.
            Fast, free, and easy to use for creators and developers.
          </p>
        </div>
      </div>
    </section>
  );
}
