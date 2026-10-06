import { Metadata } from 'next';
import Link from 'next/link';
import { LISTING_POLICY_TEXT } from '@/lib/listing-policy';

export const metadata: Metadata = {
  title: 'Terms and Conditions | LocalPages.ph',
  description: 'Rules for using LocalPages.ph, submitting business listings, and accessing the Philippine business directory.',
};

const sections = [
  {
    title: '1. Acceptance of these terms',
    body: [
      'These Terms and Conditions govern your access to and use of LocalPages.ph, including the website, directory, search pages, user accounts, business dashboards, business profile pages, listing submission tools, and related features.',
      'By accessing or using LocalPages.ph, creating an account, submitting a listing, or interacting with a business profile, you agree to these terms. If you do not agree, do not use the website.',
    ],
  },
  {
    title: '2. What LocalPages.ph provides',
    body: [
      'LocalPages.ph is a Philippine business directory that helps users discover local businesses, stores, services, professionals, organizations, and related contact information.',
      'We provide directory, search, listing, profile, review, inquiry, and account-management features. We are not a party to transactions, bookings, quotations, payments, employment, warranties, or agreements between users and listed businesses unless expressly stated in writing.',
    ],
  },
  {
    title: '3. Accounts and responsibilities',
    body: [
      'You are responsible for keeping your login credentials secure and for activities under your account. You must provide accurate, current, and lawful information when creating an account, updating your profile, or submitting business details.',
      'You must not impersonate another person or business, create misleading accounts, access another user account, bypass security controls, or use LocalPages.ph for unlawful, harmful, fraudulent, or abusive activity.',
    ],
  },
  {
    title: '4. Business listings',
    body: [
      'If you submit or manage a business listing, you represent that you are authorized to act for the business and to publish the submitted information on LocalPages.ph.',
      'Business listings must be accurate, lawful, relevant, and not misleading. You are responsible for keeping business name, description, category, address, phone numbers, email address, website, images, hours, and other details up to date.',
      LISTING_POLICY_TEXT,
      'This is a directory eligibility policy, not a legal determination about a business. Reviewers make decisions manually. If a listing is rejected or suspended, its owner can view the reason in the business dashboard and request a review through support. Missing information or registration documents normally require correction and resubmission instead.',
      'We may review, approve, reject, edit, unpublish, suspend, or remove listings that are incomplete, inaccurate, duplicated, misleading, abusive, unlawful, spam-like, irrelevant, or inconsistent with the purpose of the directory.',
    ],
  },
  {
    title: '5. User content',
    body: [
      'User content includes business descriptions, images, logos, cover photos, gallery media, documents, reviews, ratings, inquiry messages, profile details, and any other content submitted to LocalPages.ph.',
      'You retain ownership of content you submit, but you grant LocalPages.ph a non-exclusive, worldwide, royalty-free license to host, store, display, reproduce, resize, format, publish, distribute, and use that content as needed to operate, promote, secure, and improve the directory.',
      'You must not submit content that infringes intellectual property rights, violates privacy rights, contains confidential information you are not authorized to disclose, is defamatory, obscene, discriminatory, threatening, deceptive, malicious, or otherwise unlawful.',
    ],
  },
  {
    title: '6. Reviews, inquiries, and contact features',
    body: [
      'Reviews, ratings, inquiry forms, phone links, email links, map links, and share buttons are provided to help users interact with businesses. You must use these features respectfully and lawfully.',
      'Do not submit fake reviews, spam, harassment, threats, irrelevant messages, malicious links, or content intended to manipulate a business reputation. We may moderate, hide, or remove content that violates these terms or harms the reliability of the directory.',
      'LocalPages.ph does not guarantee that a business will respond to inquiries, honor published information, provide a particular service, or meet user expectations.',
    ],
  },
  {
    title: '7. Verification and directory accuracy',
    body: [
      'Some listings may display trust, verification, featured, premium, or similar indicators. These indicators are directory signals only and do not guarantee licensing, regulatory compliance, service quality, availability, pricing, safety, or fitness for a particular purpose.',
      'Although we aim to keep directory information useful and accurate, business details can change. Users should verify important information directly with the business before visiting, purchasing, booking, relying on directions, or sharing personal information.',
    ],
  },
  {
    title: '8. Prohibited uses',
    body: [
      'You must not scrape, harvest, copy, or reuse directory data at scale without permission; interfere with website operation; upload malware; probe or bypass security; overload infrastructure; reverse engineer non-public systems; or use automated tools in a way that harms the service.',
      'You must not use LocalPages.ph to publish illegal offers, regulated services without proper authority, scams, false claims, counterfeit goods, harmful content, or content that violates Philippine law or the rights of others.',
    ],
  },
  {
    title: '9. Third-party links and services',
    body: [
      'LocalPages.ph may link to business websites, social media pages, map services, phone numbers, email addresses, analytics providers, authentication providers, storage providers, and other third-party services.',
      'We do not control third-party websites or services and are not responsible for their content, security, availability, policies, or practices. Your use of third-party services may be subject to their own terms and privacy policies.',
    ],
  },
  {
    title: '10. Intellectual property',
    body: [
      'The LocalPages.ph name, website design, interface, code, branding, page layout, and directory organization are owned by or licensed to LocalPages.ph, except for content submitted by users or third parties.',
      'You may use the website for ordinary directory browsing and legitimate business-listing purposes. You may not copy, sell, resell, mirror, frame, or commercially exploit the website or directory data except as allowed by these terms or with written permission.',
    ],
  },
  {
    title: '11. Privacy',
    body: [
      'Our collection and use of personal data is described in our Privacy Policy. By using LocalPages.ph, you acknowledge that personal data may be processed as described there.',
    ],
  },
  {
    title: '12. Suspension and removal',
    body: [
      'We may suspend accounts, restrict access, remove content, reject listings, or disable features when we reasonably believe these terms have been violated, the website is being misused, legal risk exists, or action is needed to protect users, businesses, or LocalPages.ph.',
      'We may also update, discontinue, or change features at any time as the website develops.',
    ],
  },
  {
    title: '13. Disclaimers',
    body: [
      'LocalPages.ph is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted access, error-free operation, complete accuracy, immediate listing approval, search ranking, business performance, customer leads, or specific commercial results.',
      'Directory information, reviews, images, contact details, business descriptions, and third-party links may be provided by users or businesses. To the fullest extent allowed by law, LocalPages.ph is not liable for decisions made based on directory content or interactions with listed businesses.',
    ],
  },
  {
    title: '14. Limitation of liability',
    body: [
      'To the fullest extent allowed by Philippine law, LocalPages.ph and its operators will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, loss of profits, loss of data, business interruption, reputational harm, or disputes between users and listed businesses arising from use of the website.',
      'Nothing in these terms excludes liability that cannot be excluded under applicable law.',
    ],
  },
  {
    title: '15. Governing law',
    body: [
      'These terms are governed by the laws of the Republic of the Philippines. Any dispute relating to LocalPages.ph should first be raised with us so the parties can attempt to resolve it in good faith.',
    ],
  },
  {
    title: '16. Changes to these terms',
    body: [
      'We may update these Terms and Conditions from time to time. The latest version will be posted on this page with the effective date below. Continued use of LocalPages.ph after updates means you accept the updated terms.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Back to LocalPages.ph
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm text-slate-500">Effective date: July 11, 2026</p>
          <p className="mt-6 text-base leading-7 text-slate-600">
            These terms explain the rules for using LocalPages.ph, browsing the directory, creating accounts, submitting business listings, and interacting with listed businesses.
          </p>
        </div>

        <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {sections.map((section) => (
            <section key={section.title} id={section.title === '4. Business listings' ? 'listing-policy' : undefined}>
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
              For questions about these terms, contact{' '}
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
