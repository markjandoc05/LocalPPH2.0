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
  from?: string;
  replyTo?: string;
};

type TemplateKey = keyof typeof DEFAULT_EMAIL_TEMPLATES;
type TemplateValues = Record<string, string | number | null | undefined>;
type EmailNotificationResult = {
  sent: boolean;
  reason?: string;
  message?: string;
  messageId?: string;
  diagnostics?: SmtpDiagnostics;
};

type TemplatedEmailNotificationResult = EmailNotificationResult & {
  subject: string;
  text: string;
};

let transporter: Transporter | null = null;
let transporterConfigKey = '';

const smtpEnvCandidates = {
  host: ['SMTP_HOST', 'EMAIL_SERVER_HOST', 'MAIL_HOST', 'HOSTINGER_SMTP_HOST'],
  port: ['SMTP_PORT', 'EMAIL_SERVER_PORT', 'MAIL_PORT', 'HOSTINGER_SMTP_PORT'],
  user: ['SMTP_USER', 'SMTP_USERNAME', 'EMAIL_SERVER_USER', 'MAIL_USER', 'MAIL_USERNAME', 'HOSTINGER_SMTP_USER'],
  pass: ['SMTP_PASSWORD', 'SMTP_PASS', 'EMAIL_SERVER_PASSWORD', 'MAIL_PASSWORD', 'MAIL_PASS', 'HOSTINGER_SMTP_PASSWORD'],
  from: ['SMTP_FROM', 'EMAIL_FROM', 'MAIL_FROM', 'HOSTINGER_SMTP_FROM'],
  secure: ['SMTP_SECURE', 'EMAIL_SERVER_SECURE', 'MAIL_SECURE', 'HOSTINGER_SMTP_SECURE'],
};

type SmtpField = keyof typeof smtpEnvCandidates;
type SmtpDiagnostics = {
  configured: boolean;
  missing: SmtpField[];
  present: Record<SmtpField, boolean>;
  acceptedEnvNames: typeof smtpEnvCandidates;
};

const getEnvValue = (names: readonly string[]) => {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
};

const getSmtpConfig = async () => {
  const host = getEnvValue(smtpEnvCandidates.host);
  const port = Number(getEnvValue(smtpEnvCandidates.port) || 587);
  const user = getEnvValue(smtpEnvCandidates.user);
  const pass = getEnvValue(smtpEnvCandidates.pass);
  const from = getEnvValue(smtpEnvCandidates.from) || user;
  const secureEnv = getEnvValue(smtpEnvCandidates.secure)?.toLowerCase();
  const secure = secureEnv ? secureEnv === 'true' || secureEnv === '1' : port === 465;

  if (host && user && pass && from) {
    return { host, port, user, pass, from, secure, rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false' };
  }

  try {
    const settings = await getSettings();
    const smtp = settings.smtp;
    if (smtp?.enabled && smtp.host && smtp.user && smtp.password && (smtp.from || smtp.user)) {
      const settingsPort = Number(smtp.port || 587);
      return {
        host: smtp.host.trim(),
        port: settingsPort,
        user: smtp.user.trim(),
        pass: smtp.password,
        from: (smtp.from || smtp.user).trim(),
        secure: Boolean(smtp.secure),
        rejectUnauthorized: smtp.rejectUnauthorized !== false,
      };
    }
  } catch (error) {
    console.error('Failed to load SMTP settings:', error);
  }

  return null;
};

export const getSmtpDiagnostics = async (): Promise<SmtpDiagnostics> => {
  let settingsSmtp: any = null;
  try {
    settingsSmtp = (await getSettings()).smtp;
  } catch {
    settingsSmtp = null;
  }

  const present = {
    host: Boolean(getEnvValue(smtpEnvCandidates.host) || (settingsSmtp?.enabled && settingsSmtp?.host)),
    port: Boolean(getEnvValue(smtpEnvCandidates.port) || (settingsSmtp?.enabled && settingsSmtp?.port)),
    user: Boolean(getEnvValue(smtpEnvCandidates.user) || (settingsSmtp?.enabled && settingsSmtp?.user)),
    pass: Boolean(getEnvValue(smtpEnvCandidates.pass) || (settingsSmtp?.enabled && settingsSmtp?.password)),
    from: Boolean(getEnvValue(smtpEnvCandidates.from) || getEnvValue(smtpEnvCandidates.user) || (settingsSmtp?.enabled && (settingsSmtp?.from || settingsSmtp?.user))),
    secure: Boolean(getEnvValue(smtpEnvCandidates.secure) || (settingsSmtp?.enabled && settingsSmtp?.secure !== undefined)),
  };
  const missing = (['host', 'user', 'pass', 'from'] as SmtpField[]).filter((field) => !present[field]);

  return {
    configured: missing.length === 0,
    missing,
    present,
    acceptedEnvNames: smtpEnvCandidates,
  };
};

const getEmailErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error || 'Unknown SMTP error');
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

const getTransporter = async () => {
  const config = await getSmtpConfig();
  if (!config) return null;

  const configKey = JSON.stringify({
    host: config.host,
    port: config.port,
    user: config.user,
    from: config.from,
    secure: config.secure,
    rejectUnauthorized: config.rejectUnauthorized,
  });
  if (transporter && transporterConfigKey === configKey) return transporter;

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: config.rejectUnauthorized === false
      ? { rejectUnauthorized: false }
      : undefined,
  });
  transporterConfigKey = configKey;

  return transporter;
};

export const sendEmailNotification = async ({ to, subject, text, html, from, replyTo }: SendEmailInput): Promise<EmailNotificationResult> => {
  const mailer = await getTransporter();
  const config = await getSmtpConfig();
  const recipients = (Array.isArray(to) ? to : [to])
    .map(formatRecipient)
    .filter(Boolean) as string[];

  if (recipients.length === 0) {
    return { sent: false, reason: 'missing_recipient' };
  }

  if (!mailer || !config) {
    const diagnostics = await getSmtpDiagnostics();
    console.warn('Email notification skipped: SMTP environment variables are not configured.', diagnostics);
    return {
      sent: false,
      reason: 'missing_smtp_config',
      message: diagnostics.missing.length > 0
        ? `Missing SMTP field(s): ${diagnostics.missing.join(', ')}.`
        : 'SMTP environment variables are not configured.',
      diagnostics,
    };
  }

  const options: SendMailOptions = {
    from: from || config.from,
    envelope: {
      from: config.user,
      to: recipients,
    },
    to: recipients,
    subject,
    text,
    html: html || textToHtml(text),
    replyTo,
  };

  try {
    const info = await mailer.sendMail(options);
    const accepted = Array.isArray(info.accepted) ? info.accepted.map(String) : [];
    const rejected = Array.isArray(info.rejected) ? info.rejected.map(String) : [];

    if (accepted.length === 0) {
      return {
        sent: false,
        reason: 'recipient_not_accepted',
        message: rejected.length > 0
          ? `SMTP rejected recipient(s): ${rejected.join(', ')}`
          : 'SMTP did not accept any recipients.',
      };
    }

    console.info('Email notification accepted by SMTP.', {
      accepted,
      rejected,
      messageId: info.messageId,
    });

    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email notification failed:', error);
    return { sent: false, reason: 'send_failed', message: getEmailErrorMessage(error) };
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

export const verifyEmailNotificationReady = async (key: TemplateKey): Promise<EmailNotificationResult> => {
  const config = await getSmtpConfig();
  if (!config) {
    const diagnostics = await getSmtpDiagnostics();
    return {
      sent: false,
      reason: 'missing_smtp_config',
      message: diagnostics.missing.length > 0
        ? `Missing SMTP field(s): ${diagnostics.missing.join(', ')}.`
        : 'SMTP is not configured for application email notifications.',
      diagnostics,
    };
  }

  const template = await getEmailTemplate(key);
  if (!template.enabled) {
    return {
      sent: false,
      reason: 'template_disabled',
      message: 'The required email notification template is disabled.',
    };
  }

  const mailer = await getTransporter();
  if (!mailer) {
    return {
      sent: false,
      reason: 'missing_smtp_transport',
      message: 'SMTP transport could not be created.',
    };
  }

  try {
    await mailer.verify();
    return { sent: true };
  } catch (error) {
    console.error('SMTP verification failed:', error);
    return {
      sent: false,
      reason: 'smtp_verification_failed',
      message: getEmailErrorMessage(error),
    };
  }
};

export const requireEmailNotificationSent = (result: EmailNotificationResult, action: string) => {
  if (result.sent) return;

  const reason = result.message || result.reason || 'Email notification was not sent.';
  throw new Error(`${action}: ${reason}`);
};

const sendTemplatedNotification = async (
  key: TemplateKey,
  to: EmailRecipient | EmailRecipient[],
  values: TemplateValues,
): Promise<TemplatedEmailNotificationResult> => {
  const template = await getEmailTemplate(key);
  const subject = renderTemplate(template.subject || DEFAULT_EMAIL_TEMPLATES[key].subject, values).trim();
  const text = renderTemplate(template.body || DEFAULT_EMAIL_TEMPLATES[key].body, values).trim();

  if (!template.enabled) {
    return { sent: false, reason: 'template_disabled', subject, text };
  }

  const result = await sendEmailNotification({ to, subject, text });
  return { ...result, subject, text };
};

export const notifyAdminsOfUpgradeRequest = async (admins: EmailRecipient[], requester: EmailRecipient) => {
  return sendTemplatedNotification('upgradeRequestAdmin', admins, {
    requesterName: requester.name || requester.email || 'User',
    requesterEmail: requester.email || 'Not provided',
    adminUsersUrl: `${SITE_URL}/admin/users`,
  });
};

export const notifyUserOfAccountUpgrade = async (user: EmailRecipient) => {
  return sendTemplatedNotification('upgradeApprovedUser', user, {
    userName: user.name || 'there',
    userEmail: user.email || '',
    businessDashboardUrl: `${SITE_URL}/business`,
  });
};

export const notifyUserOfApprovedListing = async (user: EmailRecipient, businessName: string, slug?: string | null) => {
  return sendTemplatedNotification('listingApprovedOwner', user, {
    userName: user.name || 'there',
    userEmail: user.email || '',
    businessName,
    businessUrl: `${SITE_URL}${slug ? `/business/${slug}` : '/business'}`,
  });
};

export const notifyUserOfListingRevision = async (
  user: EmailRecipient,
  listing: { id: string; businessName: string; revisionReason: string },
) => {
  return sendTemplatedNotification('listingRevisionOwner', user, {
    userName: user.name || 'there',
    userEmail: user.email || '',
    businessName: listing.businessName,
    revisionReason: listing.revisionReason || 'Please review the requested updates in your business listing.',
    editListingUrl: `${SITE_URL}/business/listings/${listing.id}/edit`,
  });
};

export const notifyUserOfListingModeration = async (
  user: EmailRecipient,
  listing: { id: string; businessName: string; status: 'REJECTED' | 'SUSPENDED'; moderationReason: string },
) => sendTemplatedNotification(listing.status === 'REJECTED' ? 'listingRejectedOwner' : 'listingSuspendedOwner', user, {
  userName: user.name || 'there', userEmail: user.email || '', businessName: listing.businessName,
  moderationReason: listing.moderationReason, editListingUrl: `${SITE_URL}/business/listings/${listing.id}/edit`,
});

export const notifyUserOfListingRevisionReminder = async (
  user: EmailRecipient,
  listing: { id: string; businessName: string; revisionReason: string },
) => {
  return sendTemplatedNotification('listingRevisionReminderOwner', user, {
    userName: user.name || 'there',
    userEmail: user.email || '',
    businessName: listing.businessName,
    revisionReason: listing.revisionReason || 'Please upload the requested business registration document.',
    editListingUrl: `${SITE_URL}/business/listings/${listing.id}/edit`,
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
  return sendTemplatedNotification('listingSubmittedAdmin', admins, {
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
  return sendTemplatedNotification('inquiryReceivedOwner', owner, {
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
  return sendTemplatedNotification('inquiryReplyUser', sender, {
    userName: sender.name || 'there',
    userEmail: sender.email || '',
    businessName: inquiry.businessName,
    inquirySubject: inquiry.subject,
    message: inquiry.message,
    myInquiriesUrl: `${SITE_URL}/inquiries`,
  });
};
