import StealModeShowcase from "@/components/sections/StealModeShowcase";
import YouTubeThumbnailGrabber from "@/components/sections/YouTubeThumbnailGrabber";
import YouTubeThumbnailGrabberHero from "@/components/sections/YouTubeThumbnailGrabberHero";

export default function YouTubeThumbnailGrabberPage() {
  return (
    <>
      <YouTubeThumbnailGrabberHero />
      <YouTubeThumbnailGrabber />
      <StealModeShowcase />
    </>
  );
}
