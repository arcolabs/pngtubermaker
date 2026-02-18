"use client";

import { Download, Pencil, Star, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Comparison() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-left md:text-center">
          <div className="flex items-center justify-start gap-x-3 md:justify-center">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-yellow-400 fill-yellow-400"
                />
              ))}
              <Star className="w-4 h-4 text-gray-300 fill-gray-300" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              4.5 stars from happy creators
            </span>
          </div>

          <h2 className="max-w-2xl mx-auto mt-3 text-2xl font-bold tracking-tight text-primary sm:text-3xl lg:text-[42px] lg:leading-[48px]">
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
            <div className="relative w-full aspect-video rounded-lg ring-1 ring-gray-200 overflow-hidden">
              <Image
                src="/images/comparison_left.jpg"
                alt="PNGTuberMaker AI generation process"
                fill
                className="object-cover"
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
                  title: "2. AI generates multiple expressions",
                  time: "1-2 minutes",
                  desc: "Smiling, angry, surprised, sad — all auto-generated with consistent style.",
                },
                {
                  icon: Download,
                  title: "3. Download and go live",
                  time: "instant",
                  desc: "Use your PNG avatar with OBS, Twitch, Discord right away.",
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
            <div className="relative w-full aspect-video rounded-lg ring-1 ring-gray-200 overflow-hidden">
              <Image
                src="/images/comparison_right.jpg"
                alt="Traditional art commission process"
                fill
                className="object-cover"
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
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-6 pb-3.5 pt-2.5 text-lg font-bold leading-6 text-white shadow-lg shadow-primary/25 transition-all duration-150 hover:bg-primary/90 sm:w-auto"
          >
            <span className="hidden md:inline-flex">
              Create Your PNGTuber Avatar in Minutes
            </span>
            <span className="md:hidden">Create Your Avatar</span>
          </Link>

          {/* Trust Badge */}
          <div className="w-full flex items-center justify-center mt-6">
            <div className="max-w-[400px] bg-gray-50 p-4 text-left rounded-md space-y-2 opacity-70 hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-3 relative">
                <div className="uppercase size-6 shrink-0 rounded-full font-bold text-xs flex items-center justify-center text-gray-700 bg-gray-300">
                  AK
                </div>
                <p className="font-semibold text-[13px] leading-[18px] tracking-tight text-gray-900">
                  Alex Kim - Twitch Streamer
                </p>
                <div className="absolute top-1 right-0 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm font-bold leading-5 tracking-tight text-gray-900">
                Perfect for streaming
              </p>

              <p className="text-[13px] font-normal tracking-tight text-gray-600 line-clamp-2">
                Generated my avatar in 3 minutes and my viewers love it! Way
                better than spending weeks waiting for commissioned art.
              </p>

              <p className="text-[12px] text-gray-500">
                Date of experience: January 15, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
