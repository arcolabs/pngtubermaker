import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: `Refund and cancellation policy for ${brand.name}`,
  alternates: { canonical: "/legal/refund" },
  openGraph: { url: "https://pngtubermaker.com/legal/refund" },
};

const lastUpdated = "July 1, 2026";

export default function RefundPage() {
  const h2 = "text-xl font-semibold text-base-content mt-10";
  const email = (
    <a href={`mailto:${brand.contact.email}`} className="link link-primary">
      {brand.contact.email}
    </a>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-base-content mb-2">
        Refund &amp; Cancellation Policy
      </h1>
      <p className="text-sm text-base-content/50 mb-8">
        Last updated: {lastUpdated}
      </p>

      <div className="space-y-4 text-base-content/80 leading-relaxed">
        <h2 className={h2}>Overview</h2>
        <p>
          This Refund &amp; Cancellation Policy explains how billing,
          cancellation, and refunds work for paid {brand.name} plans. It forms
          part of, and should be read together with, our{" "}
          <a href="/legal/terms" className="link link-primary">
            Terms of Service
          </a>
          . The Services are provided by {company.legalName}, a Wyoming limited
          liability company.
        </p>

        <h2 className={h2}>Subscriptions and Billing</h2>
        <p>
          Paid plans (such as Start and Pro) are subscriptions billed in advance
          on a recurring monthly or yearly basis through our payment processor,
          Stripe. Each plan includes a generation allowance or set of features
          described at checkout and on our pricing page. By subscribing, you
          authorize us to charge your payment method automatically at the start
          of each billing cycle until you cancel.
        </p>

        <h2 className={h2}>Free Plan</h2>
        <p>
          The Free plan is available at no cost and includes a limited monthly
          generation allowance. No payment is collected for the Free plan, and
          no refund applies to it.
        </p>

        <h2 className={h2}>Cancellation</h2>
        <p>
          You may cancel your subscription at any time from your account
          settings or by contacting us at {email}. When you cancel, your plan
          remains active until the end of the billing cycle you have already
          paid for, and it will not renew afterward. After the cycle ends, your
          account reverts to the Free plan. Cancelling does not automatically
          generate a refund for the current billing cycle.
        </p>

        <h2 className={h2}>Refunds</h2>
        <p>
          Payments are generally non-refundable, and we do not provide refunds
          or credits for partial billing periods, unused generation allowances,
          or time during which your account remained open but was not used. This
          reflects the nature of the Services, which deliver AI-generated
          digital content on demand.
        </p>
        <p>
          Notwithstanding the above, we will provide refunds where required by
          applicable law and may, at our discretion, issue a full or partial
          refund in circumstances such as:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            a duplicate charge, accidental purchase, or a renewal charged
            immediately after an unnoticed billing cycle where you had not used
            the plan;
          </li>
          <li>
            a sustained technical failure on our side that prevented you from
            using the paid Services and that we were unable to resolve;
          </li>
          <li>
            a billing error or an amount charged that does not match the plan
            you selected.
          </li>
        </ul>

        <h2 className={h2}>
          Consumer Rights (EU, UK, and Similar Jurisdictions)
        </h2>
        <p>
          If you are a consumer in the EU, UK, or another jurisdiction with a
          statutory withdrawal or cooling-off period, you may be entitled to a
          refund within the applicable period after purchase. Because the
          Services provide digital content on demand, by starting to generate
          avatars or otherwise using the paid Services during that period you
          acknowledge that you may lose the right to withdraw for content
          already delivered. Nothing in this Policy limits any non-waivable
          statutory rights you have as a consumer.
        </p>

        <h2 className={h2}>Credits and Generation Allowances</h2>
        <p>
          Generation allowances and credits are consumed as you generate content
          and expire at the end of the applicable billing cycle. They have no
          cash value, are non-transferable, and are non-refundable, except where
          required by law or where a charge falls within the discretionary
          refund circumstances above.
        </p>

        <h2 className={h2}>How to Request a Refund</h2>
        <p>
          To request a refund, contact us at {email} from the email address
          associated with your account within 14 days of the charge. Please
          include your account email, the date and amount of the charge, and a
          short description of the issue. We aim to review refund requests
          within 5 business days. Approved refunds are issued to the original
          payment method through Stripe; the time for the funds to appear
          depends on your payment provider.
        </p>

        <h2 className={h2}>Chargebacks</h2>
        <p>
          If you believe a charge is incorrect, please contact us first so we
          can resolve it quickly. Initiating a chargeback or payment dispute
          without contacting us may result in suspension or termination of your
          account while the dispute is investigated.
        </p>

        <h2 className={h2}>Changes to This Policy</h2>
        <p>
          We may update this Policy from time to time. If we make material
          changes, we will take reasonable steps to notify you, such as by
          updating this page or providing in-product notice. Changes apply to
          purchases made after the updated Policy takes effect.
        </p>

        <h2 className={h2}>Contact</h2>
        <p>
          Questions about billing, cancellations, or refunds can be sent to{" "}
          {email}, by phone at {company.phone}, or by mail at{" "}
          {company.addressLines.join(", ")}.
        </p>
      </div>
    </div>
  );
}
