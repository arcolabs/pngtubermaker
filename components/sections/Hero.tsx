import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero min-h-[60vh]">
      <div className="hero-content text-center">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-base-content">
            Build Faster.
            <br className="sm:hidden" /> Ship Better.
          </h1>

          <p className="py-6 text-base-content/60 text-lg max-w-2xl mx-auto">
            A production-ready Next.js template with authentication, database,
            and storage. Start building your next project in minutes.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login" className="btn btn-primary">
              Get Started
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
