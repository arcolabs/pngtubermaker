import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${brand.name}`,
};

const lastUpdated = "July 1, 2026";

export default function PrivacyPage() {
  const h2 = "text-xl font-semibold text-base-content mt-10";
  const email = (
    <a href={`mailto:${brand.contact.email}`} className="link link-primary">
      {brand.contact.email}
    </a>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-base-content mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-base-content/50 mb-8">
        Last updated: {lastUpdated}
      </p>

      <div className="space-y-4 text-base-content/80 leading-relaxed">
        <h2 className={h2}>Introduction</h2>
        <p>
          This Privacy Policy explains how {brand.name} collects, uses,
          discloses, and protects information when you use our website,
          applications, software, AI avatar generation, media processing,
          storage, billing, support, and related services. The entity
          responsible for this policy is {company.legalName}, a Wyoming limited
          liability company.
        </p>

        <h2 className={h2}>Scope</h2>
        <p>
          This policy applies to personal information we process through the
          Services. It does not apply to third-party websites, platforms,
          payment processors, streaming platforms, social networks, or other
          services that have their own privacy policies.
        </p>

        <h2 className={h2}>Information We Collect</h2>
        <p>We collect information you provide directly, including:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            account and profile information, such as name, email address,
            avatar, login information, and preferences;
          </li>
          <li>
            contact, support, and communications information, such as messages
            with us, feedback, survey responses, issue reports, and marketing
            preferences;
          </li>
          <li>
            generation inputs, such as text prompts, reference images, uploaded
            files, style selections, and other materials you submit to generate
            avatars;
          </li>
          <li>
            generated and project content, such as avatars, expression packs,
            animations, variations, exports, and related metadata;
          </li>
          <li>
            billing and transaction information, such as plan, subscription,
            credits, invoices, tax details, billing address, payment status,
            refunds, disputes, and chargebacks.
          </li>
        </ul>
        <p>
          We collect information automatically, including IP address,
          approximate location derived from IP address, device and browser
          information, pages viewed, referring URLs, log data, feature usage,
          analytics events, errors, performance data, and fraud or abuse
          signals.
        </p>

        <h2 className={h2}>Sign-In and Connected Accounts</h2>
        <p>
          When you sign in with a third-party account such as Google, GitHub,
          Discord, or Twitch, we receive basic profile and authentication
          information such as your account identifier, name, email address, and
          avatar, as permitted by that provider and your settings. We use this
          information to create and operate your account. Third-party platforms
          process information under their own policies.
        </p>

        <h2 className={h2}>Payment Data</h2>
        <p>
          We use payment processors such as Stripe to process payments,
          subscriptions, invoices, credits, taxes, fraud checks, disputes, and
          chargebacks. We do not store complete payment card numbers. Payment
          processors may provide us with limited billing information, such as
          customer identifiers, subscription status, invoice history, payment
          status, billing address, tax information, card brand, and last four
          digits, as needed to operate paid services.
        </p>

        <h2 className={h2}>Cookies and Similar Technologies</h2>
        <p>
          We use cookies, local storage, pixels, SDKs, and similar technologies
          to operate the Services, remember settings, understand usage, improve
          performance, prevent abuse, and measure marketing. Essential cookies
          are required for core functionality such as login, security, routing,
          fraud prevention, billing, and service delivery. Functional cookies
          remember preferences, analytics cookies help us understand usage and
          improve the Services, and advertising cookies help measure campaigns
          and attribute signups. You can control cookies through your browser
          settings.
        </p>

        <h2 className={h2}>How We Use Information</h2>
        <p>We use information to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>provide, operate, secure, and improve the Services;</li>
          <li>
            generate, edit, render, store, and export avatars, expression packs,
            animations, and related assets;
          </li>
          <li>
            manage accounts, support, subscriptions, credits, billing, refunds,
            and service communications;
          </li>
          <li>
            detect, prevent, investigate, and respond to fraud, abuse, security
            incidents, rights complaints, and violations of our Terms;
          </li>
          <li>
            analyze usage, debug errors, measure performance, develop features,
            and improve reliability;
          </li>
          <li>
            send onboarding, product, support, billing, legal, and marketing
            communications where permitted by law;
          </li>
          <li>comply with law and enforce agreements.</li>
        </ul>

        <h2 className={h2}>AI and Media Processing</h2>
        <p>
          We process Content with AI models, media processing systems, rendering
          infrastructure, storage providers, and other service providers to
          generate and deliver output. Content may include prompts, reference
          images, uploaded files, generated avatars, and related output. We do
          not publicly display your private Content or non-public output without
          your permission. We will not use your private Content or non-public
          output to train our own foundation models unless we disclose that use
          or obtain your permission. Third-party AI and media providers may
          process Content as our service providers or as described in their own
          applicable terms and policies.
        </p>

        <h2 className={h2}>How We Share Information</h2>
        <p>We may share information with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            service providers that help with hosting, storage, authentication,
            analytics, email, support, payment processing, fraud prevention, AI
            generation, media processing, moderation, and security;
          </li>
          <li>
            professional advisors such as lawyers, accountants, auditors,
            insurers, and security consultants;
          </li>
          <li>
            authorities or other parties when required by law, legal process,
            rights protection, safety, security, fraud prevention, or service
            integrity;
          </li>
          <li>
            a successor or potential successor in connection with a merger,
            financing, acquisition, reorganization, bankruptcy, or sale of
            assets.
          </li>
        </ul>
        <p>
          We do not sell your personal information in the ordinary meaning of
          the word, and we do not share private Content for third-party
          advertising.
        </p>

        <h2 className={h2}>Legal Bases for Processing</h2>
        <p>
          Where applicable law requires a legal basis, we process personal
          information to perform our contract with you, based on our legitimate
          interests, with your consent, to comply with legal obligations, and to
          protect rights, safety, security, and service integrity. Our
          legitimate interests include operating the Services, preventing abuse,
          improving reliability, supporting customers, measuring performance,
          and developing product features.
        </p>

        <h2 className={h2}>Retention and Deletion</h2>
        <p>
          We retain information for as long as needed to provide the Services,
          maintain records, comply with legal obligations, resolve disputes,
          enforce agreements, prevent abuse, and protect the Services. Retention
          periods vary based on the type of information, account status, plan
          limits, legal requirements, backups, and operational needs. If you
          delete projects or close your account, we may retain certain
          information where required or permitted by law, for billing records,
          security logs, backups, dispute prevention, rights enforcement, or
          legitimate business purposes.
        </p>

        <h2 className={h2}>Security</h2>
        <p>
          We use administrative, technical, and organizational safeguards
          designed to protect information, including access controls, encryption
          in transit where appropriate, monitoring, backups, and vendor review.
          No method of transmission or storage is completely secure, and we
          cannot guarantee absolute security.
        </p>

        <h2 className={h2}>International Processing</h2>
        <p>
          We and our service providers may process information in countries
          other than where you live. These countries may have data protection
          laws that differ from those in your jurisdiction. Where required, we
          use appropriate safeguards for international transfers.
        </p>

        <h2 className={h2}>Your Choices and Rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct,
          delete, export, restrict, or object to processing of your personal
          information. You may also have the right to withdraw consent, object
          to direct marketing, opt out of certain processing, or appeal a
          privacy-rights decision. You can unsubscribe from marketing emails
          using the link in those emails. We may still send service-related
          messages, such as account, security, billing, and legal notices. To
          exercise privacy rights, contact us at {email}. We may need to verify
          your request before acting on it.
        </p>

        <h2 className={h2}>Children</h2>
        <p>
          {brand.name} is not intended for children under 16, and we do not
          knowingly collect personal information from children under 16. If you
          believe a child provided personal information to us, contact us so we
          can take appropriate action.
        </p>

        <h2 className={h2}>Third-Party Links and Services</h2>
        <p>
          The Services may link to or integrate with third-party websites,
          products, platforms, or services. We are not responsible for their
          privacy practices. Review their policies before providing information
          to them or connecting accounts.
        </p>

        <h2 className={h2}>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If changes are
          material, we will take reasonable steps to notify users, such as
          updating this page, sending email, or providing in-product notice. The
          updated policy will be effective when posted unless stated otherwise.
        </p>

        <h2 className={h2}>Contact</h2>
        <p>
          Questions about this Privacy Policy can be sent to {email}, by phone
          at {company.phone}, or by mail at {company.addressLines.join(", ")}.
        </p>
      </div>
    </div>
  );
}
