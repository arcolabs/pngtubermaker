import Hero from "@/components/sections/Hero";
import Showcase from "@/components/sections/Showcase";

export default function Home() {
  return (
    <>
      <Hero />
      <Showcase />
      {/* Placeholder for future sections */}
      <section id="features" className="scroll-mt-16" />
      <section id="how-it-works" className="scroll-mt-16" />
      <section id="pricing" className="scroll-mt-16" />
    </>
  );
}
