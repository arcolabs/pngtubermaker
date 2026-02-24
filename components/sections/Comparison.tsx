"use client";

import { Download, Monitor, Pencil, Star, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";

export default function Comparison() {
  const { user, isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-left md:text-center">
          <h2 className="max-w-2xl mx-auto text-2xl font-bold tracking-tight text-primary sm:text-3xl lg:text-[42px] lg:leading-[48px]">
            How Your Ideas Become Professional PNGTubers
          </h2>

          <p className="mt-3 text-base font-medium text-gray-600 sm:text-lg md:mx-auto md:max-w-2xl lg:text-xl">
            Save hundreds of dollars and weeks of waiting by using AI to
            generate your perfect streaming avatar in minutes.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="mt-8 gap-6 sm:mt-12 md:flex md:justify-center">
          {/* With PNGTuberMaker Card */}
          <div className="w-full rounded-lg border border-primary/15 bg-white p-6 md:p-8 shadow-lg lg:max-w-lg">
            <div className="relative w-full aspect-[2/1] rounded-lg ring-1 ring-gray-200 overflow-hidden bg-gray-50">
              <Image
                src="/images/comparison_left.jpg"
                alt="PNGTuberMaker AI generation process"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="mt-6 flex items-center gap-2">
              <p className="text-xl font-bold text-primary">With</p>
              <span className="text-xl font-bold text-primary">
                PNGTuberMaker
              </span>
            </div>

            <ul className="mt-6 space-y-4 md:space-y-6">
              {[
                {
                  icon: Pencil,
                  title: "1. Describe your avatar idea",
                  time: "1 minute",
                  desc: "Type your style or upload a sketch. AI understands your vision perfectly.",
                },
                {
                  icon: Users,
                  title: "2. AI generates expressions",
                  time: "1-2 minutes",
                  desc: "Smiling, angry, surprised, sad — 10+ expressions auto-generated with consistent style.",
                },
                {
                  icon: Monitor,
                  title: "3. One-click OBS setup",
                  time: "instant",
                  desc: "Paste a single Browser Source link into OBS. Your avatar lip-syncs to your mic in real time.",
                },
                {
                  icon: Download,
                  title: "4. Download and go live",
                  time: "instant",
                  desc: "Export PNGs or ZIP bundles for OBS, Twitch, Discord — stream-ready in seconds.",
                },
              ].map((step) => (
                <li
                  key={step.title}
                  className="flex items-start gap-2 md:gap-4"
                >
                  <div className="hidden sm:flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold leading-none tracking-tight text-primary">
                      {step.title}
                      <span className="font-normal text-gray-500 hidden md:inline-flex ml-2">
                        ({step.time})
                      </span>
                    </p>
                    <p className="mt-1 text-base font-normal text-gray-600">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* VS Divider */}
          <div className="relative hidden min-h-full w-px shrink-0 bg-gray-300/50 md:block">
            <span className="absolute left-1/2 top-1/2 w-8 -translate-x-1/2 -translate-y-1/2 bg-white py-2 text-center text-sm font-medium text-gray-400 rounded-full border border-gray-200">
              vs
            </span>
          </div>

          {/* Traditional Commission Card */}
          <div className="mt-4 w-full rounded-lg border border-gray-200/50 bg-white p-6 md:p-8 shadow-lg md:mt-0 lg:max-w-lg">
            <div className="relative w-full aspect-[2/1] rounded-lg ring-1 ring-gray-200 overflow-hidden bg-gray-50">
              <Image
                src="/images/comparison_right.jpg"
                alt="Traditional art commission process"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <p className="mt-6 text-xl font-bold text-gray-700">
              Traditional Commission
            </p>

            <ul className="mt-4 space-y-2 md:space-y-3 text-base font-normal text-gray-600">
              {[
                "Find and hire an artist on Fiverr/DeviantArt",
                "Wait for their response and negotiate price",
                "Pay $50–$200+ for one set of PNGs",
                "Wait 1–3 weeks for delivery",
                "Risk inconsistent quality or revisions",
                "Repeat for new expressions or styles",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <X className="w-5 h-5 shrink-0 text-red-400" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                Expensive & Slow
              </span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative mt-8 text-center sm:mt-12">
          <Link
            href={user ? "/create" : "/login"}
            className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-6 pb-3.5 pt-2.5 text-lg font-bold leading-6 text-white shadow-lg shadow-primary/25 transition-all duration-150 hover:bg-primary/90 sm:w-auto"
          >
            <span className="hidden md:inline-flex">
              {user
                ? "Create Your PNGTuber Now"
                : "Create Your PNGTuber Avatar — Free"}
            </span>
            <span className="md:hidden">
              {user ? "Create Now" : "Get Started Free"}
            </span>
          </Link>

          {/* Value Props */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-primary fill-primary" />
              No drawing skills needed
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-primary fill-primary" />
              Ready in under 5 minutes
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-primary fill-primary" />
              Works directly in OBS
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
