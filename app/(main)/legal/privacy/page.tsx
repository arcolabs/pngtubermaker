import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${brand.name}`,
};

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-base-content mb-8">
        Privacy Policy
      </h1>

      <div className="space-y-6 text-base-content/80">
        <p>
          This Privacy Policy describes how {brand.name} collects, uses, and
          shares your information.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          1. Information We Collect
        </h2>
        <p>
          We collect information you provide directly to us, such as when you
          create an account, use our services, or contact us for support.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          2. How We Use Information
        </h2>
        <p>
          We use the information we collect to provide, maintain, and improve
          our services, to communicate with you, and to protect our rights and
          the rights of users.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          3. Information Sharing
        </h2>
        <p>
          We do not sell your personal information. We may share information
          with service providers who assist us in operating our services.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          4. Data Security
        </h2>
        <p>
          We implement appropriate security measures to protect your personal
          information. However, no method of transmission over the Internet is
          100% secure.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          5. Your Rights
        </h2>
        <p>
          You have the right to access, update, or delete your personal
          information. Contact us to exercise these rights.
        </p>

        <h2 className="text-xl font-semibold text-base-content mt-8">
          6. Contact
        </h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at{" "}
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
