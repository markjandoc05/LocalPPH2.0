import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | LocalPages.ph',
  description: 'How LocalPages.ph collects, uses, protects, and manages personal data for its Philippine business directory.',
};

const sections = [
  {
    title: '1. Who we are',
    body: [
      'LocalPages.ph is a Philippine business directory that helps users discover local businesses, services, stores, professionals, and organizations. This Privacy Policy explains how we collect, use, store, disclose, and protect personal data when you use our website, create an account, submit a business listing, contact a listed business, or interact with our services.',
      'This policy is intended to follow the principles of Republic Act No. 10173, also known as the Data Privacy Act of 2012, its Implementing Rules and Regulations, and applicable issuances of the National Privacy Commission.',
    ],
  },
  {
    title: '2. Personal data we collect',
    body: [
      'Account information: name, email address, login credentials handled through our authentication provider, account role, account status, and profile details you choose to provide.',
      'Business listing information: business name, description, category, subcategory, location, address details, phone number, mobile number, email address, website, social media links, business hours, logo, cover image, gallery images, registration or verification documents, and other information submitted for publication or review.',
      'Directory interaction data: searches, filters, listing views, call clicks, email clicks, map or direction clicks, share actions, review interactions, and similar usage events.',
      'Inquiry and review information: name, email address, message content, ratings, review text, and related interaction details submitted through forms on business profile pages.',
      'Technical and device data: IP address, browser type, device information, approximate location derived from technical data, cookies, pages visited, referring pages, timestamps, and diagnostic logs.',
      'Administrative and support data: information needed to review listings, manage user accounts, respond to requests, investigate misuse, and maintain website security.',
    ],
  },
  {
    title: '3. Why we use personal data',
    body: [
      'To operate the LocalPages.ph directory, display approved business listings, and make businesses searchable by name, category, and location.',
      'To create and manage user accounts, business dashboards, profile pages, business listings, listing status, and admin review workflows.',
      'To verify business information, moderate submitted content, prevent spam or fraud, and protect users and listed businesses.',
      'To allow users to contact businesses, click phone or email links, submit inquiries, share listings, and interact with public business profiles.',
      'To measure website performance, understand search and listing usage, improve navigation, fix errors, and develop better directory features.',
      'To communicate service-related notices, respond to support requests, enforce our Terms and Conditions, and comply with legal obligations.',
    ],
  },
  {
    title: '4. Legal bases for processing',
    body: [
      'We process personal data when you give consent, when processing is necessary to provide requested website services, when necessary for our legitimate interests as a business directory, when required to comply with law, or when needed to protect users, businesses, the website, or the public from misuse or harm.',
      'For sensitive personal information or verification documents, we process only what is reasonably necessary for listing review, trust and safety, fraud prevention, legal compliance, or another permitted purpose under applicable law.',
    ],
  },
  {
    title: '5. Public business listings',
    body: [
      'Information submitted for an approved business listing may become publicly visible on LocalPages.ph. This can include business name, description, address or service area, category, phone or mobile number, email address, website, social links, images, hours, and other listing details.',
      'Do not submit private personal data in a business listing unless you are authorized to publish it. If you submit information on behalf of a business, you confirm that you have authority to do so and that the information is accurate, lawful, and suitable for public display.',
    ],
  },
  {
    title: '6. Cookies, analytics, and tracking',
    body: [
      'We use cookies and similar technologies to keep the site working, remember cookie preferences, understand directory usage, measure page performance, and improve the user experience.',
      'Depending on site settings and your consent choices, LocalPages.ph may use analytics or marketing tools such as Google Analytics, Google Tag Manager, Microsoft Clarity, Meta Pixel, or similar services. These providers may receive technical and usage data subject to their own policies.',
      'You can control cookies through your browser settings. Some website features may not work properly if cookies or local storage are disabled.',
    ],
  },
  {
    title: '7. When we share personal data',
    body: [
      'We may share personal data with service providers that help us operate authentication, hosting, storage, analytics, security, email, technical support, and website infrastructure.',
      'We may disclose public listing information to website visitors, search engines, maps, social previews, and other systems that help people find local businesses.',
      'We may disclose information when required by law, legal process, regulators, law enforcement, or when necessary to protect rights, safety, security, prevent fraud, investigate misuse, or enforce our Terms and Conditions.',
      'We do not sell personal data as a standalone product. If we introduce paid advertising, sponsored placement, or premium listing features, we will handle related personal data according to this policy and applicable law.',
    ],
  },
  {
    title: '8. Storage, retention, and security',
    body: [
      'We keep personal data only for as long as reasonably needed for the purposes described in this policy, unless a longer retention period is required or allowed by law, dispute resolution, security, audit, fraud prevention, or legitimate business needs.',
      'Account and business listing data may be kept while the account or listing remains active. Public listing data may remain visible until removed, rejected, unpublished, deleted, or updated through the available account or admin processes.',
      'We use reasonable organizational, physical, and technical safeguards designed to protect personal data against accidental or unlawful destruction, loss, alteration, unauthorized access, disclosure, or other unlawful processing. No website or internet transmission is completely secure, so users should also protect their own accounts and devices.',
    ],
  },
  {
    title: '9. Your privacy rights',
    body: [
      'Subject to the Data Privacy Act of 2012 and its rules, you may have the right to be informed, object to processing, access your personal data, request correction of inaccurate data, request erasure or blocking, withdraw consent where processing is based on consent, request data portability where applicable, and seek damages for violations of your privacy rights.',
      'To exercise these rights, contact us at support@localpages.ph. We may need to verify your identity and the account, listing, or data involved before acting on a request.',
    ],
  },
  {
    title: '10. Children',
    body: [
      'LocalPages.ph is intended for users who can lawfully use an online business directory and submit business information. We do not knowingly collect personal data from children without appropriate authority. If you believe a child has submitted personal data to us, contact support@localpages.ph so we can review the request.',
    ],
  },
  {
    title: '11. Breach notification',
    body: [
      'If we become aware of a personal data breach requiring notification under Philippine law, we will take reasonable steps to assess the incident, contain the risk, and notify the National Privacy Commission and affected data subjects when required.',
    ],
  },
  {
    title: '12. Updates to this policy',
    body: [
      'We may update this Privacy Policy when the website, services, legal requirements, or data practices change. The latest version will be posted on this page with the effective date below.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Back to LocalPages.ph
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500">Effective date: July 11, 2026</p>
          <p className="mt-6 text-base leading-7 text-slate-600">
            This policy explains how LocalPages.ph handles personal data in connection with the Philippine business directory, user accounts, business listings, contact features, analytics, and related services.
          </p>
        </div>

        <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-xl font-bold text-slate-950">Contact us</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              For privacy questions, data subject requests, or concerns about personal data on LocalPages.ph, contact us at{' '}
              <a href="mailto:support@localpages.ph" className="font-semibold text-blue-600 hover:text-blue-700">
                support@localpages.ph
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
