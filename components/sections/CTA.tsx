"use client";

import Link from "next/link";

interface CTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
}

export default function CTA({
  title = "Say Goodbye to 10 of 10s",
  subtitle = "Try Thumb-Free for Free.",
  description = "Shortcut your way to millions of views.",
  buttonText = "Try for Free",
  buttonHref = "/auth/start",
  onButtonClick,
}: CTAProps & { description?: string }) {
  const buttonOuterClassName =
    "group relative z-10 duration-300 active:scale-[0.99] p-1 border-[1.5px] border-primary/5 hover:border-primary/10 active:border-primary/0 rounded-full inline-block";

  const buttonMiddleClassName =
    "p-1 duration-300 border-primary/20 border-[1.5px] group-hover:border-primary/40 group-active:border-primary/50 rounded-full";

  const buttonInnerClassName =
    "relative z-10 rounded-full py-1.5 sm:py-2 pl-4 pr-5 flex items-center justify-center font-medium text-base sm:text-lg gap-2 border-[1.5px] border-white/50 group-hover:border-white/80 shadow-[inset_0_0_16px_rgba(255,255,255,0.2)] group-hover:shadow-[inset_0_0_16px_rgba(255,255,255,0.3)] transition-all duration-300";

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center bg-[#252525] border border-primary/5 rounded-3xl lg:rounded-4xl py-12 sm:p-20 lg:py-32 my-8 sm:my-12 lg:my-16">
      <div className="relative z-10 flex flex-col items-center sm:gap-4 gap-2">
        <h2
          className="leading-[1.1] bg-clip-text text-transparent text-3xl lg:text-4xl font-semibold tracking-tight text-center"
          style={{
            backgroundImage:
              "radial-gradient(at 50% 100%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)",
          }}
        >
          <span className="hidden sm:block">
            {title}
            <br />
          </span>
          <span className="block sm:hidden">
            {title.includes("10 of 10s")
              ? "Say Goodbye to"
              : title.split(" ").slice(0, -3).join(" ")}
            <br />
            {title.includes("10 of 10s")
              ? "10 of 10s"
              : title.split(" ").slice(-3).join(" ")}
          </span>
          <span className="mt-1 sm:mt-0">{subtitle}</span>
        </h2>
        <div className="opacity-70 text-center text-xs lg:text-base sm:pb-0 pb-4 text-[#FFFFFF80]">
          {description}
        </div>
        {onButtonClick ? (
          <button
            type="button"
            onClick={onButtonClick}
            className={buttonOuterClassName}
            aria-label={buttonText}
          >
            <div className={buttonMiddleClassName}>
              <div
                className={buttonInnerClassName}
                style={{
                  background:
                    "linear-gradient(135deg, #FF0000 0%, #E60000 50%, #CC0000 100%)",
                }}
              >
                <span className="pl-2 py-1 sm:text-lg text-base flex items-center gap-2 text-white">
                  {buttonText}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </span>
              </div>
            </div>
          </button>
        ) : (
          <Link
            href={buttonHref}
            className={buttonOuterClassName}
            aria-label={buttonText}
          >
            <div className={buttonMiddleClassName}>
              <div
                className={buttonInnerClassName}
                style={{
                  background:
                    "linear-gradient(135deg, #FF0000 0%, #E60000 50%, #CC0000 100%)",
                }}
              >
                <span className="pl-2 py-1 sm:text-lg text-base flex items-center gap-2 text-white">
                  {buttonText}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Background blur effect */}
      <div
        className="absolute inset-0 z-0 top-1/4 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(255, 0, 0, 0.15) 0%, transparent 70%)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center top",
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "100px 100px",
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
        }}
      />

      {/* Decorative SVG element */}
      <div className="absolute z-0 right-1/2 translate-x-64 sm:top-16 -top-8 flex items-center justify-center opacity-20">
        <svg
          width="1938"
          height="2627"
          viewBox="0 0 1938 2627"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1 570.475V2626H570.279V1630.83H1006.41C1441.57 1630.83 1936.81 1383.87 1936.81 842.979V759.073C1936.81 230.739 1454.89 1 1036.29 1H570.279V570.475H1294.24V1064.71H570.279V570.475H1Z"
            fill="#FF0000"
            fillOpacity="0.03"
          />
          <path
            d="M570.279 570.475V1H1036.29C1454.89 1 1936.81 230.739 1936.81 759.073V842.979C1936.81 1383.87 1441.57 1630.83 1006.41 1630.83H570.279V2626H1V570.475H570.279ZM570.279 570.475H1294.24V1064.71H570.279V570.475Z"
            stroke="url(#paint0_linear_cta)"
            strokeOpacity="0.3"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient
              id="paint0_linear_cta"
              x1="2219.15"
              y1="1884.98"
              x2="-10.3029"
              y2="1.34118"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.5" stopColor="#FF0000" stopOpacity="0.1" />
              <stop offset="0.772665" stopColor="#FF0000" />
              <stop offset="1" stopColor="#FF0000" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}
