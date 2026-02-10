import CTA from "@/components/sections/CTA";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import Showcase from "@/components/sections/Showcase";
import Testimonials from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <Showcase videoSrc="/videos/Thumbfree.mp4" />
      {/* Placeholder for future sections */}
      <section id="features" className="scroll-mt-16" />
      <section id="how-it-works" className="scroll-mt-16" />
      <section id="pricing" className="scroll-mt-16" />
      <Testimonials />
      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <FAQ />
      </div>
      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <CTA />
      </div>
    </>
  );
}
