import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

interface CTAProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
}

const HIGHLIGHTS = ["No credit card required", "Open source", "Production ready"];

export default function CTA({
  title = "Ready to Get Started?",
  subtitle = "Start building today.",
  description = "Ship your next project in minutes with our production-ready template.",
  buttonText = "Get Started",
  buttonHref = "/login",
  onButtonClick,
}: CTAProps) {
  const btnClass = "btn btn-primary btn-lg";

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="badge badge-primary badge-outline mb-6">
            Get Started Today
          </span>

          <h2 className="text-3xl md:text-5xl font-bold text-base-content">
            {title}
            <span className="block mt-2">{subtitle}</span>
          </h2>

          <p className="text-base-content/60 text-lg max-w-2xl mx-auto mt-6">
            {description}
          </p>

          <div className="mt-10">
            {onButtonClick ? (
              <button
                type="button"
                onClick={onButtonClick}
                className={btnClass}
              >
                {buttonText}
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <Link href={buttonHref} className={btnClass}>
                {buttonText}
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10 text-sm text-base-content/50">
            {HIGHLIGHTS.map((text) => (
              <span key={text} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
