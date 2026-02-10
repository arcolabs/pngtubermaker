import type { Metadata } from "next";
import CTA from "@/components/sections/CTA";
import FAQ from "@/components/sections/FAQ";
import StealModeShowcase from "@/components/sections/StealModeShowcase";
import Testimonials from "@/components/sections/Testimonials";
import YouTubeThumbnailGrabber from "@/components/sections/YouTubeThumbnailGrabber";
import YouTubeThumbnailGrabberHero from "@/components/sections/YouTubeThumbnailGrabberHero";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thumb-free.com";

export const metadata: Metadata = {
  title: "Free YouTube Thumbnail Grabber & Downloader",
  description:
    "Download YouTube thumbnails in HD quality (1280x720) for free. Grab thumbnails from any public YouTube video instantly. Multiple sizes available.",
  keywords: [
    "YouTube thumbnail downloader",
    "YouTube thumbnail grabber",
    "download YouTube thumbnails",
    "YouTube thumbnail HD",
    "free thumbnail downloader",
    "YouTube video thumbnail",
  ],
  alternates: {
    canonical: `${baseUrl}/youtube-thumbnail-grabber`,
  },
  openGraph: {
    title: "Free YouTube Thumbnail Grabber & Downloader",
    description:
      "Download YouTube thumbnails in HD quality instantly. Free, fast, no registration required.",
    url: `${baseUrl}/youtube-thumbnail-grabber`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YouTube Thumbnail Grabber - Download HD thumbnails for free",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free YouTube Thumbnail Grabber",
    description:
      "Download YouTube thumbnails in HD quality instantly. Free and easy to use.",
    images: ["/og-image.jpg"],
  },
};

export default function YouTubeThumbnailGrabberPage() {
  return (
    <>
      <YouTubeThumbnailGrabberHero />
      <YouTubeThumbnailGrabber />
      <StealModeShowcase />
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
      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
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
