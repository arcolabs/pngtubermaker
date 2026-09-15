import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${brand.name}`,
  alternates: { canonical: "/legal/terms" },
  openGraph: { url: "https://pngtubermaker.com/legal/terms" },
};

const effectiveDate = "July 1, 2026";

export default function TermsPage() {
  const h2 = "text-xl font-semibold text-base-content mt-10";
  const email = (
    <a href={`mailto:${brand.contact.email}`} className="link link-primary">
      {brand.contact.email}
    </a>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-base-content mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-base-content/50 mb-8">
        Effective date: {effectiveDate}
      </p>

      <div className="space-y-4 text-base-content/80 leading-relaxed">
        <h2 className={h2}>Introduction</h2>
        <p>
          Welcome to {brand.name}. These Terms of Service govern your access to
          and use of the {brand.name} website, applications, software, products,
          services, and features, including AI-assisted avatar generation,
          expression packs, animation generation, image editing, upscaling,
          storage, export, and related workflows (collectively, the "Services").
          If you do not understand or agree to these Terms, you may not use the
          Services.
        </p>

        <h2 className={h2}>Your Services Provider</h2>
        <p>
          The entity providing the Services is {company.legalName}, a Wyoming
          limited liability company. References to "{brand.name}", "we", "us",
          and "our" mean {company.legalName}. You may contact us at {email}, by
          phone at {company.phone}, or by mail at{" "}
          {company.addressLines.join(", ")}.
        </p>

        <h2 className={h2}>Applicable Terms</h2>
        <p>
          These Terms, our Privacy Policy, our Refund &amp; Cancellation Policy,
          and any plan, checkout, order, product, or feature-specific terms
          presented to you form the agreement between you and {brand.name}. If
          additional terms apply to a specific feature, subscription, credit
          package, promotion, integration, or transaction, those additional
          terms are incorporated into this agreement for that feature or
          transaction.
        </p>

        <h2 className={h2}>Who May Use the Services</h2>
        <p>
          You must be at least 16 years old to use the Services. If you are
          under the age of majority where you live, you represent that you have
          permission from a parent or legal guardian, and that your parent or
          guardian has reviewed and accepted these Terms. If you use the
          Services on behalf of a company or organization, you represent that
          you have authority to bind that entity, and that entity accepts these
          Terms.
        </p>

        <h2 className={h2}>Accounts</h2>
        <p>
          You may need an account to access certain Services. You agree to
          provide accurate, complete, and current information, keep your
          credentials secure, and promptly update account and billing
          information when it changes. You are responsible for activity under
          your account. You may not sell, rent, transfer, or share your account,
          credits, or credentials without our prior permission. We may access
          accounts, projects, logs, and related information as needed to provide
          support, troubleshoot, maintain security, prevent abuse, comply with
          law, or administer the Services.
        </p>

        <h2 className={h2}>Third-Party Sign-In and Integrations</h2>
        <p>
          The Services allow you to sign in using third-party accounts such as
          Google, GitHub, Discord, and Twitch. By connecting a third-party
          account, you permit us to access, use, process, and store basic
          profile and authentication information from that account as needed to
          create and operate your account. You are responsible for your
          relationship with third-party services and for complying with their
          terms and policies. We are not responsible for third-party services,
          and your use of them may be subject to separate terms and policies.
        </p>

        <h2 className={h2}>The Services</h2>
        <p>
          {brand.name} is an AI avatar platform for streamers, VTubers, and
          content creators. The Services help users turn text prompts, reference
          images, and related materials into PNGTuber and VTuber avatars and
          related assets, including base avatars, expression packs, animations,
          variations, upscaled exports, and metadata. We may modify, improve,
          suspend, limit, or discontinue features of the Services from time to
          time. We will try to provide reasonable notice when a material change
          materially reduces functionality available to paid users, but this may
          not always be practical.
        </p>

        <h2 className={h2}>Content on the Services</h2>
        <p>
          "Content" means avatars, images, graphics, photographs, text, prompts,
          reference images, expressions, animations, brand assets, names, logos,
          voices, likenesses, templates, metadata, and other materials available
          through or submitted to the Services.
        </p>
        <p>
          "Publicity Rights" means rights in a person's name, photograph, image,
          voice, likeness, persona, signature, biographical information, or
          other identifying attributes, whether real, synthetic, cloned, or
          simulated. You are responsible for obtaining all permissions needed to
          use Publicity Rights in Content, prompts, inputs, and output.
        </p>

        <h2 className={h2}>Your Content</h2>
        <p>
          You retain ownership of Content you submit, upload, import, prompt, or
          otherwise provide to the Services ("User Content"). You grant{" "}
          {brand.name} a worldwide, non-exclusive, royalty-free, sublicensable
          license to host, store, reproduce, process, analyze, adapt, modify,
          create derivative works from, transmit, and display User Content as
          needed to provide, secure, support, maintain, and operate the
          Services, including requested generation, editing, rendering, storage,
          and export workflows.
        </p>
        <p>
          You represent and warrant that you have all rights, licenses,
          permissions, and consents required to provide User Content and allow
          us and our service providers to process it. You may not submit User
          Content that infringes another party's rights, violates law, contains
          unlawful or harmful material, includes sensitive personal data you are
          not authorized to provide, or violates these Terms.
        </p>

        <h2 className={h2}>Training, Feedback, and Service Improvement</h2>
        <p>
          We may use account information, usage data, logs, feedback, support
          requests, and aggregated or de-identified information to operate,
          secure, analyze, and improve the Services. We will not use your
          private User Content or non-public output to train our own foundation
          models unless we disclose that use or obtain your permission.
          Third-party AI, media, and hosting providers may process Content as
          our service providers or as otherwise described in their applicable
          terms and policies. If you submit feedback, suggestions, ideas, or bug
          reports, you grant us a perpetual, worldwide, royalty-free license to
          use them without restriction or compensation.
        </p>

        <h2 className={h2}>Generated Output</h2>
        <p>
          Subject to these Terms and your payment of applicable fees, you may
          use output generated for you by the Services for your personal,
          streaming, business, marketing, educational, and distribution
          purposes. Where your plan includes a commercial license, that license
          applies to output generated while the plan is active. To the extent we
          own transferable rights in output generated specifically for you, we
          assign or license those rights to you for your permitted use of that
          output.
        </p>
        <p>
          You are responsible for reviewing output before using, exporting, or
          publishing it. AI-assisted output may be inaccurate, incomplete,
          offensive, non-unique, or unsuitable for your intended use. Similar or
          identical output may be generated for other users. We do not guarantee
          that output is unique, protectable, non-infringing, or eligible for
          copyright, trademark, or other intellectual property protection.
        </p>
        <p>
          Output rights do not include ownership of the Services, our software,
          models, workflows, templates, prompts, interfaces, branding,
          documentation, or third-party assets included in or used to create
          output. Your right to use output may also be limited by asset
          licenses, third-party platform rules, payment status, or restrictions
          presented in the product.
        </p>

        <h2 className={h2}>Synthetic Media, Voice, and Likeness</h2>
        <p>
          If you use the Services to create, edit, clone, simulate, or publish a
          person's face, image, likeness, identity, voice, performance, or
          persona, you must have all required rights, permissions, and
          disclosures. You must not use synthetic media or generated avatars to
          deceive, impersonate, defame, harass, exploit, or falsely imply
          authorization, endorsement, employment, investment, customer status,
          partnership, or affiliation.
        </p>

        <h2 className={h2}>Permissions and Restrictions</h2>
        <p>
          You may use the Services only as permitted by these Terms and
          applicable law. You may not:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>violate any law, regulation, contract, or third-party right;</li>
          <li>
            create or distribute misleading, deceptive, defamatory, infringing,
            abusive, exploitative, obscene, hateful, violent, or harmful
            Content, including sexual content involving minors;
          </li>
          <li>
            impersonate another person or falsely imply sponsorship,
            endorsement, affiliation, employment, partnership, investment, or
            customer approval;
          </li>
          <li>
            use a person's name, image, voice, likeness, identity, or other
            Publicity Rights without required authorization;
          </li>
          <li>
            submit malware, secrets, payment card data, health information,
            government identifiers, or sensitive personal data unless the
            Services expressly support that use;
          </li>
          <li>
            scrape, crawl, spider, overload, disrupt, reverse engineer,
            decompile, or bypass the Services, security controls, rate limits,
            access restrictions, models, algorithms, or underlying systems;
          </li>
          <li>
            use output, data, prompts, responses, or access to the Services to
            build, train, tune, evaluate, or benchmark a competing model,
            product, or service;
          </li>
          <li>
            buy, sell, transfer, or misuse accounts, subscriptions, credits, or
            credentials without our permission;
          </li>
          <li>
            manipulate credits, billing, reporting, complaints, flags, appeals,
            or abuse-detection systems;
          </li>
          <li>
            use the Services for spam, fraud, scams, phishing, or unlawful
            surveillance;
          </li>
          <li>
            use the Services in violation of export controls, sanctions, or
            restrictions applicable to you or us.
          </li>
        </ul>
        <p>
          A violation may result in removal of Content, cancellation of credits,
          suspension, termination, reporting to platforms or authorities, or
          other restrictions.
        </p>

        <h2 className={h2}>Monitoring and Enforcement</h2>
        <p>
          We may use automated and manual systems to detect abuse, security
          issues, fraud, rights violations, unsafe Content, or violations of
          these Terms. We may remove, block, restrict, label, or refuse to
          generate Content at our discretion. We are not obligated to monitor
          all Content or to host, store, preserve, or serve any Content.
        </p>

        <h2 className={h2}>Paid Services, Subscriptions, and Credits</h2>
        <p>
          Certain Services require payment, subscriptions, or usage credits.
          Pricing, plan limits, renewal terms, credit rules, taxes, and refund
          terms are presented at checkout, in the product, in our Refund &amp;
          Cancellation Policy, or in applicable plan terms. By purchasing Paid
          Services, you authorize us and our payment processors to charge your
          selected payment method. You represent that you have the legal right
          to use the payment method you provide, and you must keep your billing
          information current, complete, and accurate.
        </p>
        <p>
          Subscriptions renew automatically unless cancelled before the next
          renewal date. We may change subscription fees or plan features
          prospectively and will provide notice where required by law or by the
          applicable plan terms. If you do not agree to a change, you must
          cancel before the change takes effect.
        </p>
        <p>
          Credits and monthly generation allowances are not money, stored value,
          gift cards, or property. They may be used only for the Services, are
          non-transferable, and have no cash value. Unless plan terms state
          otherwise, generation allowances and credits are consumed by
          generation attempts and expire at the end of the applicable billing
          cycle. Credits may expire, be limited by plan, be consumed by
          completed generations, or be cancelled if obtained through fraud,
          abuse, payment failure, refund, chargeback, or violation of these
          Terms. We may restore credits or retry jobs at our discretion where a
          failure is caused by the Services, but we are not responsible for
          failures caused by your Content, account settings, third-party
          providers, or network conditions.
        </p>
        <p>
          Fees are non-refundable except as required by law, as expressly stated
          at checkout, or as set out in our Refund &amp; Cancellation Policy.
          You are responsible for taxes, duties, currency conversion costs, bank
          fees, chargebacks, and other amounts related to your purchase. If
          payment fails, we may suspend or limit access to Paid Services.
        </p>

        <h2 className={h2}>Trials, Promotions, and Referrals</h2>
        <p>
          We may offer trials, discounts, credits, referral rewards, or other
          promotions. Promotional terms may be changed or ended at any time
          unless prohibited by law. We may revoke promotional benefits if we
          believe they were obtained by fraud, abuse, duplicate accounts,
          ineligible referrals, or violation of the promotion's terms.
        </p>

        <h2 className={h2}>Third-Party Services</h2>
        <p>
          The Services integrate with or rely on third-party providers for
          hosting, storage, authentication, analytics, email, payments, AI
          generation, media processing, and other functionality. We are not
          responsible for third-party services, and your use of them may be
          subject to separate terms and policies. Third-party services may
          change, suspend, rate limit, deprecate, deny, or terminate their
          services, APIs, permissions, pricing, or terms, and those changes may
          affect the availability, quality, cost, or behavior of the Services.
        </p>

        <h2 className={h2}>Our Intellectual Property</h2>
        <p>
          We and our licensors own the Services, including software, design,
          workflows, templates, models, prompts, documentation, interfaces,
          trademarks, logos, systems, and other materials. These Terms do not
          transfer ownership of our intellectual property to you. Subject to
          these Terms, we grant you a limited, non-exclusive, non-transferable,
          revocable license to access and use the Services for your permitted
          purposes. You may not copy, modify, distribute, sell, lease,
          sublicense, or exploit the Services except as expressly permitted.
        </p>

        <h2 className={h2}>Privacy</h2>
        <p>
          Our{" "}
          <a href="/legal/privacy" className="link link-primary">
            Privacy Policy
          </a>{" "}
          explains how we collect, use, disclose, and protect personal
          information. By using the Services, you acknowledge that we process
          information as described in the Privacy Policy.
        </p>

        <h2 className={h2}>Copyright and Rights Complaints</h2>
        <p>
          If you believe Content available through the Services infringes your
          copyright, trademark, publicity, privacy, or other rights, send a
          notice to {email} with: your name, organization, mailing address,
          phone, and email; identification of the work, identity, mark, voice,
          likeness, or other right you claim is infringed; identification of the
          material you want removed, including URLs or other details sufficient
          for us to locate it; a statement that you have a good faith belief the
          disputed use is not authorized by the owner, its agent, or the law; a
          statement that the information in your notice is accurate and that you
          are authorized to act on behalf of the rights owner; and your physical
          or electronic signature. We may remove or restrict Content, notify the
          user who supplied it, and terminate repeat infringers where
          appropriate.
        </p>

        <h2 className={h2}>Communications</h2>
        <p>
          We may send you service, account, security, billing, product, and
          support communications. You may opt out of marketing communications,
          but we may still send transactional or service-related messages.
        </p>

        <h2 className={h2}>Service Availability and Data</h2>
        <p>
          We do not guarantee that the Services or any Content will always be
          available, uninterrupted, secure, or preserved. You are responsible
          for keeping copies of important User Content and output. We may delete
          or restrict Content in accordance with plan limits, retention periods,
          account status, legal obligations, security needs, or these Terms.
        </p>

        <h2 className={h2}>Suspension and Termination</h2>
        <p>
          You may stop using the Services at any time. We may suspend or
          terminate access if you violate these Terms, create legal or security
          risk, fail to pay amounts owed, or use the Services in a way that may
          harm us, users, third parties, platforms, providers, or the Services.
          Termination may result in loss of access to your account, projects,
          Content, output, and credits. Terms that by their nature should
          survive termination will survive, including ownership, payment
          obligations, restrictions, disclaimers, limitations of liability,
          indemnity, governing law, and dispute-related terms.
        </p>

        <h2 className={h2}>Disclaimers</h2>
        <p>
          The Services and output are provided "as is" and "as available." To
          the fullest extent permitted by law, we disclaim all warranties,
          whether express, implied, statutory, or otherwise, including
          warranties of merchantability, fitness for a particular purpose,
          title, non-infringement, availability, accuracy, and quiet enjoyment.
          We do not guarantee that the Services will be uninterrupted, secure,
          accurate, available, or error-free, or that output will produce any
          particular result.
        </p>

        <h2 className={h2}>Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, {brand.name} and its
          operators, affiliates, officers, employees, agents, licensors, and
          service providers will not be liable for indirect, incidental,
          special, consequential, exemplary, or punitive damages, or for lost
          profits, revenue, data, goodwill, business opportunities, Content,
          output, credits, or platform accounts. Our total liability for any
          claim relating to the Services will not exceed the amount you paid to
          use the Services in the three months before the claim, or $100 if you
          have not paid us.
        </p>

        <h2 className={h2}>Indemnity</h2>
        <p>
          You agree to defend, indemnify, and hold harmless {brand.name} and its
          operators, affiliates, officers, employees, agents, licensors, and
          service providers from claims, damages, liabilities, losses, and
          expenses arising from your Content, output, use of the Services,
          connected third-party accounts, violation of these Terms, or violation
          of any law, platform rule, provider term, or third-party right.
        </p>

        <h2 className={h2}>Export Controls and Sanctions</h2>
        <p>
          You may not use, export, re-export, or transfer the Services in
          violation of applicable export control or sanctions laws. You
          represent that you are not located in, organized under the laws of, or
          ordinarily resident in a country or territory subject to comprehensive
          sanctions, and that you are not listed on any applicable restricted
          party list.
        </p>

        <h2 className={h2}>Governing Law and Venue</h2>
        <p>
          These Terms are governed by the laws of the State of Wyoming, without
          regard to conflict of law rules. To the extent a dispute is not
          subject to another valid dispute process, you and {brand.name} agree
          to the exclusive jurisdiction and venue of the state and federal
          courts located in Wyoming for disputes arising from or relating to
          these Terms or the Services.
        </p>

        <h2 className={h2}>Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. If we make material
          changes, we will take reasonable steps to notify you, such as by
          updating this page, sending email, or providing in-product notice.
          Your continued use of the Services after updated Terms take effect
          means you accept the updated Terms.
        </p>

        <h2 className={h2}>Miscellaneous</h2>
        <p>
          You may not assign these Terms without our prior written consent. We
          may assign these Terms in connection with a merger, acquisition,
          financing, reorganization, sale of assets, or by operation of law. If
          any provision is found unenforceable, the remaining provisions will
          remain in effect. Our failure to enforce a provision is not a waiver.
          These Terms are the entire agreement between you and us regarding the
          Services.
        </p>

        <h2 className={h2}>Contact</h2>
        <p>
          Contact us at {email}, by phone at {company.phone}, or by mail at{" "}
          {company.addressLines.join(", ")}.
        </p>
      </div>
    </div>
  );
}
