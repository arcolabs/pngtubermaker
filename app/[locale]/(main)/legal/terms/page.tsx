import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${brand.name}`,
};

export default function TermsPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-base-content mb-8">
        Terms of Service
      </h1>

      <div className="space-y-6 text-base-content/80">
        <p>
          Welcome to {brand.name}. By accessing or using our service, you agree
          to be bound by these Terms of Service.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using {brand.name}, you agree to be bound by these
          Terms of Service and all applicable laws and regulations.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          2. Use License
        </h2>
        <p>
          Permission is granted to use this template for personal and commercial
          projects. This is the grant of a license, not a transfer of title.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          3. Disclaimer
        </h2>
        <p>
          This template is provided "as is" without warranty of any kind. The
          author(s) make no representations or warranties regarding the accuracy
          or reliability of the template.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          4. Limitation of Liability
        </h2>
        <p>
          In no event shall {brand.name} or its contributors be liable for any
          damages arising out of the use or inability to use this template.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          5. Contact
        </h2>
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <a
            href={`mailto:${brand.contact.email}`}
            className="link link-primary"
          >
            {brand.contact.email}
          </a>
        </p>

        <p className="text-sm text-base-content/50 mt-12">
          Last updated: {currentYear}
        </p>
      </div>
    </div>
  );
}
