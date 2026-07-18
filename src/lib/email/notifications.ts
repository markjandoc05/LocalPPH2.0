import nodemailer from 'nodemailer';
import type { SendMailOptions, Transporter } from 'nodemailer';
import { SITE_URL } from '@/lib/seo/metadata';
import { DEFAULT_EMAIL_TEMPLATES, getSettings } from '@/lib/settings/settings-service';

type EmailRecipient = {
  email?: string | null;
  name?: string | null;
};

type SendEmailInput = {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  text: string;
  html?: string;
};

type TemplateKey = keyof typeof DEFAULT_EMAIL_TEMPLATES;
type TemplateValues = Record<string, string | number | null | undefined>;

let transporter: Transporter | null = null;

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;
  const secureEnv = process.env.SMTP_SECURE?.toLowerCase();
  const secure = secureEnv ? secureEnv === 'true' || secureEnv === '1' : port === 465;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return { host, port, user, pass, from, secure };
};

const formatRecipient = (recipient: EmailRecipient) => {
  if (!recipient.email) return null;
  return recipient.name ? `"${recipient.name.replace(/"/g, '')}" <${recipient.email}>` : recipient.email;
};

const textToHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br />');

const getTransporter = () => {
  if (transporter) return transporter;

  const config = getSmtpConfig();
  if (!config) return null;

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return transporter;
};

export const sendEmailNotification = async ({ to, subject, text, html }: SendEmailInput) => {
  const mailer = getTransporter();
  const config = getSmtpConfig();
  const recipients = (Array.isArray(to) ? to : [to])
    .map(formatRecipient)
    .filter(Boolean) as string[];

  if (recipients.length === 0) {
    return { sent: false, reason: 'missing_recipient' };
  }

  if (!mailer || !config) {
    console.warn('Email notification skipped: SMTP environment variables are not configured.');
    return { sent: false, reason: 'missing_smtp_config' };
  }

  const options: SendMailOptions = {
    from: config.from,
    to: recipients,
    subject,
    text,
    html: html || textToHtml(text),
  };

  try {
    await mailer.sendMail(options);
    return { sent: true };
  } catch (error) {
    console.error('Email notification failed:', error);
    return { sent: false, reason: 'send_failed' };
  }
};

const renderTemplate = (template: string, values: TemplateValues) =>
  template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
    const value = values[key];
    return value === null || value === undefined ? '' : String(value);
  });

const getEmailTemplate = async (key: TemplateKey) => {
  try {
    const settings = await getSettings();
    return settings.emailTemplates?.[key] || DEFAULT_EMAIL_TEMPLATES[key];
  } catch (error) {
    console.error('Failed to load email template settings:', error);
    return DEFAULT_EMAIL_TEMPLATES[key];
  }
};

const sendTemplatedNotification = async (
  key: TemplateKey,
  to: EmailRecipient | EmailRecipient[],
  values: TemplateValues,
) => {
  const template = await getEmailTemplate(key);
  if (!template.enabled) {
    return { sent: false, reason: 'template_disabled' };
  }

  const subject = renderTemplate(template.subject || DEFAULT_EMAIL_TEMPLATES[key].subject, values).trim();
  const text = renderTemplate(template.body || DEFAULT_EMAIL_TEMPLATES[key].body, values).trim();

  return sendEmailNotification({ to, subject, text });
};

export const notifyAdminsOfUpgradeRequest = async (admins: EmailRecipient[], requester: EmailRecipient) => {
  await sendTemplatedNotification('upgradeRequestAdmin', admins, {
    requesterName: requester.name || requester.email || 'User',
    requesterEmail: requester.email || 'Not provided',
    adminUsersUrl: `${SITE_URL}/admin/users`,
  });
};

export const notifyUserOfAccountUpgrade = async (user: EmailRecipient) => {
  await sendTemplatedNotification('upgradeApprovedUser', user, {
    userName: user.name || 'there',
    userEmail: user.email || '',
    businessDashboardUrl: `${SITE_URL}/business`,
  });
};

export const notifyUserOfApprovedListing = async (user: EmailRecipient, businessName: string, slug?: string | null) => {
  await sendTemplatedNotification('listingApprovedOwner', user, {
    userName: user.name || 'there',
    userEmail: user.email || '',
    businessName,
    businessUrl: `${SITE_URL}${slug ? `/business/${slug}` : '/business'}`,
  });
};

export const notifyAdminsOfSubmittedListing = async (
  admins: EmailRecipient[],
  listing: {
    id: string;
    businessName: string;
    ownerName?: string | null;
    ownerEmail?: string | null;
    categoryName?: string | null;
    location?: string | null;
  },
) => {
  await sendTemplatedNotification('listingSubmittedAdmin', admins, {
    businessName: listing.businessName,
    ownerName: listing.ownerName || listing.ownerEmail || 'Business owner',
    ownerEmail: listing.ownerEmail || 'Not provided',
    categoryName: listing.categoryName || 'Not provided',
    location: listing.location || 'Not provided',
    adminListingUrl: `${SITE_URL}/admin/listings/${listing.id}`,
  });
};

export const notifyBusinessOwnerOfInquiry = async (
  owner: EmailRecipient,
  inquiry: {
    businessName: string;
    senderName?: string | null;
    senderEmail?: string | null;
    senderContactNumber?: string | null;
    subject: string;
    message: string;
  },
) => {
  await sendTemplatedNotification('inquiryReceivedOwner', owner, {
    ownerName: owner.name || 'there',
    ownerEmail: owner.email || '',
    businessName: inquiry.businessName,
    senderName: inquiry.senderName || inquiry.senderEmail || 'Registered user',
    senderEmail: inquiry.senderEmail || 'Not provided',
    senderContactNumber: inquiry.senderContactNumber || 'Not provided',
    inquirySubject: inquiry.subject,
    message: inquiry.message,
    businessInboxUrl: `${SITE_URL}/business/inquiries`,
  });
};

export const notifyInquirySenderOfReply = async (
  sender: EmailRecipient,
  inquiry: {
    businessName: string;
    subject: string;
    message: string;
  },
) => {
  await sendTemplatedNotification('inquiryReplyUser', sender, {
    userName: sender.name || 'there',
    userEmail: sender.email || '',
    businessName: inquiry.businessName,
    inquirySubject: inquiry.subject,
    message: inquiry.message,
    myInquiriesUrl: `${SITE_URL}/inquiries`,
  });
};
