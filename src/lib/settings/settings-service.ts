import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface IntegrationServiceConfig {
  enabled: boolean;
  lastChecked?: string;
  [key: string]: any;
}

export interface IntegrationSettings {
  googleAnalytics: { enabled: boolean; measurementId: string; lastChecked?: string };
  searchConsole: { enabled: boolean; verificationTag: string; lastChecked?: string };
  tagManager: { enabled: boolean; containerId: string; lastChecked?: string };
  clarity: { enabled: boolean; projectId: string; lastChecked?: string };
  metaPixel: { enabled: boolean; pixelId: string; lastChecked?: string };
  cookieConsent: { enabled: boolean; message: string; privacyPolicyUrl: string; lastChecked?: string };
  sitemap: { enabled: boolean; url: string; autoGenerate: boolean; lastChecked?: string };
  robots: { enabled: boolean; url: string; status: string; lastChecked?: string };
  openGraph: { enabled: boolean; title: string; description: string; imageUrl: string; lastChecked?: string };
  favicon: { enabled: boolean; url: string; lastChecked?: string };
  smtp: {
    enabled: boolean;
    host: string;
    port: string;
    secure: boolean;
    user: string;
    password: string;
    from: string;
    rejectUnauthorized: boolean;
  };
  emailTemplates: {
    upgradeRequestAdmin: EmailTemplateConfig;
    upgradeApprovedUser: EmailTemplateConfig;
    listingSubmittedAdmin: EmailTemplateConfig;
    listingApprovedOwner: EmailTemplateConfig;
    listingRevisionOwner: EmailTemplateConfig;
    inquiryReceivedOwner: EmailTemplateConfig;
    inquiryReplyUser: EmailTemplateConfig;
  };
}

export interface EmailTemplateConfig {
  enabled: boolean;
  subject: string;
  body: string;
}

export const DEFAULT_EMAIL_TEMPLATES: IntegrationSettings['emailTemplates'] = {
  upgradeRequestAdmin: {
    enabled: true,
    subject: 'New LocalPages.ph account upgrade request',
    body: [
      'A user requested to upgrade their LocalPages.ph account to Business.',
      '',
      'Requester: {{requesterName}}',
      'Email: {{requesterEmail}}',
      '',
      'Review the request: {{adminUsersUrl}}',
    ].join('\n'),
  },
  upgradeApprovedUser: {
    enabled: true,
    subject: 'Your LocalPages.ph account is now a Business account',
    body: [
      'Hi {{userName}},',
      '',
      'Good news. Your LocalPages.ph account upgrade request has been approved.',
      '',
      'Your account now has Business access, which means you can create, submit, and manage business listings on LocalPages.ph.',
      '',
      'Go to your business dashboard: {{businessDashboardUrl}}',
      '',
      'Thank you,',
      'The LocalPages.ph Team',
    ].join('\n'),
  },
  listingSubmittedAdmin: {
    enabled: true,
    subject: 'New business listing submitted: {{businessName}}',
    body: [
      'A business listing was submitted for admin review on LocalPages.ph.',
      '',
      'Business: {{businessName}}',
      'Owner: {{ownerName}}',
      'Owner email: {{ownerEmail}}',
      'Category: {{categoryName}}',
      'Location: {{location}}',
      '',
      'Review the listing: {{adminListingUrl}}',
    ].join('\n'),
  },
  listingApprovedOwner: {
    enabled: true,
    subject: 'Your listing is approved: {{businessName}}',
    body: [
      'Hi {{userName}},',
      '',
      '{{businessName}} has been approved and is now visible on LocalPages.ph.',
      '',
      'View listing: {{businessUrl}}',
    ].join('\n'),
  },
  listingRevisionOwner: {
    enabled: true,
    subject: 'Action needed for your LocalPages.ph listing: {{businessName}}',
    body: [
      'Hi {{userName}},',
      '',
      'Thank you for submitting {{businessName}} to LocalPages.ph.',
      '',
      'Our review team needs a few updates before the listing can be approved and published.',
      '',
      'Revision notes:',
      '{{revisionReason}}',
      '',
      'Please update your listing here: {{editListingUrl}}',
      '',
      'Once you resubmit the listing, our team will review it again as soon as possible.',
      '',
      'Thank you,',
      'The LocalPages.ph Team',
    ].join('\n'),
  },
  inquiryReceivedOwner: {
    enabled: true,
    subject: 'New inquiry for {{businessName}}: {{inquirySubject}}',
    body: [
      'Hi {{ownerName}},',
      '',
      'You received a new inquiry for {{businessName}}.',
      '',
      'From: {{senderName}}',
      'Email: {{senderEmail}}',
      'Contact number: {{senderContactNumber}}',
      'Subject: {{inquirySubject}}',
      '',
      '{{message}}',
      '',
      'Open your inquiry inbox: {{businessInboxUrl}}',
    ].join('\n'),
  },
  inquiryReplyUser: {
    enabled: true,
    subject: 'New reply from {{businessName}}: {{inquirySubject}}',
    body: [
      'Hi {{userName}},',
      '',
      '{{businessName}} replied to your inquiry.',
      '',
      '{{message}}',
      '',
      'Open My Inquiries: {{myInquiriesUrl}}',
    ].join('\n'),
  },
};

const DEFAULT_SETTINGS: IntegrationSettings = {
  googleAnalytics: { enabled: false, measurementId: "" },
  searchConsole: { enabled: false, verificationTag: "" },
  tagManager: { enabled: false, containerId: "" },
  clarity: { enabled: false, projectId: "" },
  metaPixel: { enabled: false, pixelId: "" },
  cookieConsent: { enabled: true, message: "We use cookies to improve your experience on our site.", privacyPolicyUrl: "/privacy" },
  sitemap: { enabled: true, url: "/sitemap.xml", autoGenerate: true },
  robots: { enabled: true, url: "/robots.txt", status: "Allowed" },
  openGraph: { enabled: true, title: "LocalPages PH", description: "Discover trusted local businesses in the Philippines", imageUrl: "" },
  favicon: { enabled: true, url: "/favicon.ico" },
  smtp: {
    enabled: false,
    host: "smtp.hostinger.com",
    port: "465",
    secure: true,
    user: "",
    password: "",
    from: "support@localpages.ph",
    rejectUnauthorized: true,
  },
  emailTemplates: DEFAULT_EMAIL_TEMPLATES,
};

const mergeSettings = (settings?: Partial<IntegrationSettings>): IntegrationSettings => ({
  ...DEFAULT_SETTINGS,
  ...(settings || {}),
  smtp: {
    ...DEFAULT_SETTINGS.smtp,
    ...(settings?.smtp || {}),
  },
  emailTemplates: {
    ...DEFAULT_EMAIL_TEMPLATES,
    ...(settings?.emailTemplates || {}),
  },
});

export async function getSettings(): Promise<IntegrationSettings> {
  // Real Database mode
  try {
    const record = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, "integrations"),
    });
    if (record) {
      return mergeSettings(JSON.parse(record.value));
    }
  } catch (error) {
    console.error("Failed to fetch settings from DB, returning defaults:", error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: IntegrationSettings): Promise<void> {
  const jsonStr = JSON.stringify(settings);

  // Real Database mode
  try {
    await db.insert(siteSettings)
      .values({
        key: "integrations",
        value: jsonStr,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: jsonStr,
          updatedAt: new Date(),
        }
      });
  } catch (error: any) {
    console.error("Failed to save settings to DB:", error);
    throw new Error("Database error while saving settings.");
  }
}
