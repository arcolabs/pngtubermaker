import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata = {
  title: "Privacy Policy - Thumb-Free",
  description:
    "Learn how Thumb-Free collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  const effectiveDate = "January 31, 2026";

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
        />

        {/* Content Card */}
        <div className="bg-[#1A1A1A] rounded-3xl p-8 sm:p-12 lg:p-16">
          {/* Title */}
          <h1 className="text-white font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
            Privacy Policy
          </h1>

          {/* Effective Date */}
          <p className="text-sm text-muted-foreground mb-12">
            Last updated: {effectiveDate}
          </p>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                At Thumb-Free ("we," "our," or "us"), we take your privacy
                seriously. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                AI-powered YouTube thumbnail generation service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-white font-medium text-lg mb-3">
                2.1 Personal Information
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4 mb-6">
                <li>Email address</li>
                <li>Name (optional)</li>
                <li>Profile information (optional)</li>
              </ul>

              <h3 className="text-white font-medium text-lg mb-3">
                2.2 Content Data
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To provide our service, we process:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4 mb-6">
                <li>Video titles and descriptions you provide</li>
                <li>Images you upload for thumbnail generation</li>
                <li>Generated thumbnails</li>
              </ul>

              <h3 className="text-white font-medium text-lg mb-3">
                2.3 Usage Data
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We automatically collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Device information and browser type</li>
                <li>IP address and approximate location</li>
                <li>Pages viewed and features used</li>
                <li>Time and frequency of use</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the collected information to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Generate personalized thumbnails for you</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to comments and questions</li>
                <li>Monitor and analyze usage patterns</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>
            </section>

            {/* Data Storage and Retention */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                4. Data Storage and Retention
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Your data is stored securely on our servers:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
                <li>
                  Uploaded images are retained for 30 days from generation
                </li>
                <li>Generated thumbnails are stored until you delete them</li>
                <li>Account data is retained until account deletion</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your
                data, including encryption and access controls.
              </p>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                5. Information Sharing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal data. We may share your information
                only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>
                  <span className="text-white font-medium">
                    Service Providers:
                  </span>{" "}
                  With third-party services that help us operate our service
                </li>
                <li>
                  <span className="text-white font-medium">
                    Legal Requirements:
                  </span>{" "}
                  When required by law or to protect our rights
                </li>
                <li>
                  <span className="text-white font-medium">
                    Business Transfers:
                  </span>{" "}
                  In connection with a merger or sale of assets
                </li>
                <li>
                  <span className="text-white font-medium">With Consent:</span>{" "}
                  When you explicitly consent to sharing
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                6. Your Privacy Rights
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the following rights regarding your data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>
                  <span className="text-white font-medium">Access:</span>{" "}
                  Request a copy of your personal data
                </li>
                <li>
                  <span className="text-white font-medium">Correction:</span>{" "}
                  Update or correct inaccurate data
                </li>
                <li>
                  <span className="text-white font-medium">Deletion:</span>{" "}
                  Request deletion of your personal data
                </li>
                <li>
                  <span className="text-white font-medium">Object:</span> Object
                  to processing of your data
                </li>
                <li>
                  <span className="text-white font-medium">Export:</span>{" "}
                  Request transfer of your data to another service
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, contact us at{" "}
                <a
                  href="mailto:support@thumb-free.com"
                  className="text-white hover:text-white/80 transition-colors duration-200"
                >
                  support@thumb-free.com
                </a>
                .
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                7. Cookies and Tracking
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our service</li>
                <li>Improve performance and user experience</li>
                <li>Analyze trends and metrics</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can control cookie settings through your browser
                preferences.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                8. Children&apos;s Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under 13. We do not
                knowingly collect personal information from children under 13.
                If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us.
              </p>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place to protect your data in accordance with this
                Privacy Policy and applicable laws.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new policy on
                our website and updating the "Last updated" date.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-white font-semibold text-xl mb-4">
                11. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at{" "}
                <a
                  href="mailto:support@thumb-free.com"
                  className="text-white hover:text-white/80 transition-colors duration-200"
                >
                  support@thumb-free.com
                </a>
              </p>
            </section>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
