import CTA from "@/components/sections/CTA";
import FAQ from "@/components/sections/FAQ";
import StealModeShowcase from "@/components/sections/StealModeShowcase";
import Testimonials from "@/components/sections/Testimonials";
import YouTubeThumbnailGrabber from "@/components/sections/YouTubeThumbnailGrabber";
import YouTubeThumbnailGrabberHero from "@/components/sections/YouTubeThumbnailGrabberHero";

export default function YouTubeThumbnailGrabberPage() {
  return (
    <>
      {/* Hero Section */}
      <YouTubeThumbnailGrabberHero />

      {/* Tool Interface */}
      <YouTubeThumbnailGrabber />

      {/* Feature Highlights */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>Download</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                ),
                title: "Multiple Sizes",
                description:
                  "Download thumbnails in HD (1280x720), SD (640x480), and more formats instantly.",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>Speed</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
                title: "Lightning Fast",
                description:
                  "Extract thumbnails in milliseconds. No waiting, no delays, just instant results.",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>Privacy</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ),
                title: "100% Private",
                description:
                  "No data stored, no tracking, no account required. Your downloads stay private.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl overflow-hidden
                           border border-white/10 
                           shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
                           hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.15)]
                           hover:border-white/20
                           hover:bg-white/5
                           transition-all duration-300 ease-in-out p-6"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/10 mb-4 text-white/70 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary/90 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steal Mode Showcase */}
      <StealModeShowcase />

      {/* Testimonials */}
      <Testimonials
        title="What Users Are Saying"
        description="See how creators and developers are using our thumbnail grabber tool."
        testimonials={[
          {
            id: "1",
            name: "Alex Thompson",
            role: "Content Creator",
            company: "Tech Tutorials",
            content:
              "This thumbnail grabber saves me hours every week. I can quickly download thumbnails from any video to analyze what works. The multiple size options are perfect for different use cases.",
            avatar: "/avatar/avatar_003.jpg",
          },
          {
            id: "2",
            name: "Jessica Martinez",
            role: "Video Editor",
            company: "Creative Agency",
            content:
              "As a video editor, I need quick access to reference thumbnails. This tool is incredibly fast and reliable. The HD quality downloads are exactly what I need for client presentations.",
            avatar: "/avatar/avatar_004.jpg",
          },
          {
            id: "3",
            name: "David Kim",
            role: "YouTube Strategist",
            company: "Growth Marketing",
            content:
              "I use this tool daily to research competitor thumbnails. Being able to grab multiple sizes instantly helps me understand what formats perform best. It's become essential to my workflow.",
            avatar: "/avatar/avatar_005.jpg",
          },
        ]}
      />

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FAQ
          title="YouTube Thumbnail Grabber FAQ"
          description="Common questions about grabbing YouTube thumbnails."
          supportText="Need more help?"
          supportLinkText="Contact us"
          faqData={[
            {
              id: "how-to-use",
              question: "How do I use the YouTube Thumbnail Grabber?",
              answer:
                "Simply paste any YouTube video URL into the input field and click 'Grab Thumbnail'. Our tool will instantly extract all available thumbnail sizes for that video.\n\nYou can then download any size you need - from HD (1280x720) to smaller formats (320x180).",
            },
            {
              id: "what-sizes",
              question: "What thumbnail sizes are available?",
              answer:
                "YouTube provides multiple thumbnail sizes for each video:\n\n• HD Image (1280x720) - Highest quality\n• SD Image (640x480) - High quality\n• Normal Image (480x360) - Medium quality\n• Normal Image (320x180) - Lower quality\n\nAll sizes are available for download instantly.",
            },
            {
              id: "is-free",
              question: "Is this service free?",
              answer:
                "Yes! Our YouTube Thumbnail Grabber is completely free to use. No registration required, no limits on the number of thumbnails you can grab.",
            },
            {
              id: "works-with",
              question: "Does it work with all YouTube videos?",
              answer:
                "Yes, our tool works with any public YouTube video. Simply paste the video URL and we'll extract the available thumbnails. Note that some videos may have limited thumbnail sizes available depending on the video's original upload quality.",
            },
            {
              id: "download-format",
              question: "What format are the downloaded thumbnails?",
              answer:
                "All thumbnails are downloaded in JPG format, which is the standard format used by YouTube for video thumbnails.",
            },
            {
              id: "private-videos",
              question:
                "Can I grab thumbnails from private or unlisted videos?",
              answer:
                "Our tool works with public YouTube videos. Private or unlisted videos require authentication and cannot be accessed through our public API.",
            },
          ]}
        />
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTA
          title="Ready to grab thumbnails?"
          subtitle="Start downloading YouTube thumbnails now."
          description="Free, fast, and easy to use. No registration required."
          buttonText="Grab Thumbnails"
          buttonHref="/youtube-thumbnail-grabber"
        />
      </div>
    </>
  );
}
