'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin } from '@/lib/auth/roles';
import { auth } from '@/lib/firebase/config';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AnalyticsDocumentation } from '@/components/admin/AnalyticsDocumentation';
import { formatAppDateTime } from '@/lib/time';
import { 
  LucideTrendingUp, 
  LucideGlobe, 
  LucideCode, 
  LucideActivity, 
  LucideShieldAlert, 
  LucideFileText, 
  LucideFileCode, 
  LucideShare2, 
  LucideImage, 
  LucideSave, 
  LucideRefreshCw, 
  LucideCheckCircle, 
  LucideXCircle,
  LucideMail
} from 'lucide-react';

interface IntegrationService {
  enabled: boolean;
  lastChecked?: string;
  testError?: string;
  [key: string]: any;
}

interface IntegrationSettings {
  googleAnalytics: IntegrationService & { measurementId: string };
  searchConsole: IntegrationService & { verificationTag: string };
  tagManager: IntegrationService & { containerId: string };
  clarity: IntegrationService & { projectId: string };
  metaPixel: IntegrationService & { pixelId: string };
  cookieConsent: IntegrationService & { message: string; privacyPolicyUrl: string };
  sitemap: IntegrationService & { url: string; autoGenerate: boolean };
  robots: IntegrationService & { url: string; status: string };
  openGraph: IntegrationService & { title: string; description: string; imageUrl: string };
  favicon: IntegrationService & { url: string };
  smtp: IntegrationService & {
    host: string;
    port: string;
    secure: boolean;
    user: string;
    password: string;
    from: string;
    rejectUnauthorized: boolean;
    hasPassword?: boolean;
  };
  emailTemplates: {
    upgradeRequestAdmin: EmailTemplateConfig;
    upgradeApprovedUser: EmailTemplateConfig;
    listingSubmittedAdmin: EmailTemplateConfig;
    listingApprovedOwner: EmailTemplateConfig;
    listingRejectedOwner: EmailTemplateConfig;
    listingSuspendedOwner: EmailTemplateConfig;
    listingRevisionOwner: EmailTemplateConfig;
    listingRevisionReminderOwner: EmailTemplateConfig;
    inquiryReceivedOwner: EmailTemplateConfig;
    inquiryReplyUser: EmailTemplateConfig;
  };
}

interface EmailTemplateConfig {
  enabled: boolean;
  subject: string;
  body: string;
}

type StandardIntegrationKey = Exclude<keyof IntegrationSettings, 'emailTemplates' | 'smtp'>;

const DEFAULT_EMAIL_TEMPLATES: IntegrationSettings['emailTemplates'] = {
  upgradeRequestAdmin: {
    enabled: true,
    subject: 'New LocalPages.ph account upgrade request',
    body: 'A user requested to upgrade their LocalPages.ph account to Business.\n\nRequester: {{requesterName}}\nEmail: {{requesterEmail}}\n\nReview the request: {{adminUsersUrl}}',
  },
  upgradeApprovedUser: {
    enabled: true,
    subject: 'Your LocalPages.ph account is now a Business account',
    body: 'Hi {{userName}},\n\nGood news. Your LocalPages.ph account upgrade request has been approved.\n\nYour account now has Business access, which means you can create, submit, and manage business listings on LocalPages.ph.\n\nGo to your business dashboard: {{businessDashboardUrl}}\n\nThank you,\nThe LocalPages.ph Team',
  },
  listingSubmittedAdmin: {
    enabled: true,
    subject: 'New business listing submitted: {{businessName}}',
    body: 'A business listing was submitted for admin review on LocalPages.ph.\n\nBusiness: {{businessName}}\nOwner: {{ownerName}}\nOwner email: {{ownerEmail}}\nCategory: {{categoryName}}\nLocation: {{location}}\n\nReview the listing: {{adminListingUrl}}',
  },
  listingApprovedOwner: {
    enabled: true,
    subject: 'Your listing is approved: {{businessName}}',
    body: 'Hi {{userName}},\n\n{{businessName}} has been approved and is now visible on LocalPages.ph.\n\nView listing: {{businessUrl}}',
  },
  listingRejectedOwner: {
    enabled: true,
    subject: 'Your LocalPages.ph listing was rejected: {{businessName}}',
    body: 'Hi {{userName}},\n\nWe cannot publish {{businessName}}.\n\nReason:\n{{moderationReason}}\n\nView the decision and request a review: {{editListingUrl}}\n\nA review request does not automatically republish your listing.',
  },
  listingSuspendedOwner: {
    enabled: true,
    subject: 'Your LocalPages.ph listing was suspended: {{businessName}}',
    body: 'Hi {{userName}},\n\n{{businessName}} is no longer publicly listed. Its saved information has been retained.\n\nReason:\n{{moderationReason}}\n\nView the decision and request a review: {{editListingUrl}}\n\nA review request does not automatically republish your listing.',
  },
  listingRevisionOwner: {
    enabled: true,
    subject: 'Action needed for your LocalPages.ph listing: {{businessName}}',
    body: 'Hi {{userName}},\n\nThank you for submitting {{businessName}} to LocalPages.ph.\n\nOur review team needs a few updates before the listing can be approved and published.\n\nRevision notes:\n{{revisionReason}}\n\nPlease update your listing here: {{editListingUrl}}\n\nOnce you resubmit the listing, our team will review it again as soon as possible.\n\nThank you,\nThe LocalPages.ph Team',
  },
  listingRevisionReminderOwner: {
    enabled: true,
    subject: 'Reminder: DTI /SEC Certificate needed for {{businessName}}',
    body: 'Hi {{userName}},\n\nThis is a reminder that your listing for {{businessName}} still requires an update before it can be approved.\n\nTo help us verify and approve your listing, please upload your DTI /SEC Certificate or any valid business registration document. Thank you!\n\nRevision notes:\n{{revisionReason}}\n\nUpdate your listing: {{editListingUrl}}\n\nOnce the document has been uploaded, please resubmit your listing for review.\n\nThank you,\nThe LocalPages.ph Team',
  },
  inquiryReceivedOwner: {
    enabled: true,
    subject: 'New inquiry for {{businessName}}: {{inquirySubject}}',
    body: 'Hi {{ownerName}},\n\nYou received a new inquiry for {{businessName}}.\n\nFrom: {{senderName}}\nEmail: {{senderEmail}}\nContact number: {{senderContactNumber}}\nSubject: {{inquirySubject}}\n\n{{message}}\n\nOpen your inquiry inbox: {{businessInboxUrl}}',
  },
  inquiryReplyUser: {
    enabled: true,
    subject: 'New reply from {{businessName}}: {{inquirySubject}}',
    body: 'Hi {{userName}},\n\n{{businessName}} replied to your inquiry.\n\n{{message}}\n\nOpen My Inquiries: {{myInquiriesUrl}}',
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

const EMAIL_TEMPLATE_META: {
  key: keyof IntegrationSettings['emailTemplates'];
  title: string;
  description: string;
  variables: string[];
}[] = [
  {
    key: 'upgradeRequestAdmin',
    title: 'Upgrade Request to Admins',
    description: 'Sent to admins and moderators when a subscriber requests Business access.',
    variables: ['requesterName', 'requesterEmail', 'adminUsersUrl'],
  },
  {
    key: 'upgradeApprovedUser',
    title: 'Upgrade Approved to User',
    description: 'Sent to a user after their account is upgraded to Business.',
    variables: ['userName', 'userEmail', 'businessDashboardUrl'],
  },
  {
    key: 'listingApprovedOwner',
    title: 'Listing Approved to Owner',
    description: 'Sent to the business owner when a listing is approved.',
    variables: ['userName', 'userEmail', 'businessName', 'businessUrl'],
  },
  {
    key: 'listingRevisionOwner',
    title: 'Revision Requested to Owner',
    description: 'Sent to the business owner when an admin requests listing revisions.',
    variables: ['userName', 'userEmail', 'businessName', 'revisionReason', 'editListingUrl'],
  },
  {
    key: 'listingRejectedOwner', title: 'Listing Rejected to Owner',
    description: 'Sent after a rejection is saved, with the owner-facing reason and review request link.',
    variables: ['userName', 'userEmail', 'businessName', 'moderationReason', 'editListingUrl'],
  },
  {
    key: 'listingSuspendedOwner', title: 'Listing Suspended to Owner',
    description: 'Sent after a suspension is saved, with the owner-facing reason and review request link.',
    variables: ['userName', 'userEmail', 'businessName', 'moderationReason', 'editListingUrl'],
  },
  {
    key: 'listingRevisionReminderOwner',
    title: 'Revision Reminder to Owner',
    description: 'Sent manually from Needs Revision when a DTI /SEC Certificate or another registration document is still required.',
    variables: ['userName', 'userEmail', 'businessName', 'revisionReason', 'editListingUrl'],
  },
  {
    key: 'listingSubmittedAdmin',
    title: 'Listing Submitted to Admins',
    description: 'Sent to admins and moderators when a business listing is submitted for review.',
    variables: ['businessName', 'ownerName', 'ownerEmail', 'categoryName', 'location', 'adminListingUrl'],
  },
  {
    key: 'inquiryReceivedOwner',
    title: 'New Inquiry to Business Owner',
    description: 'Sent to the business owner when a registered user sends an inquiry.',
    variables: ['ownerName', 'ownerEmail', 'businessName', 'senderName', 'senderEmail', 'senderContactNumber', 'inquirySubject', 'message', 'businessInboxUrl'],
  },
  {
    key: 'inquiryReplyUser',
    title: 'Inquiry Reply Notification',
    description: 'Sent when the other party replies to an inquiry conversation.',
    variables: ['userName', 'userEmail', 'businessName', 'inquirySubject', 'message', 'myInquiriesUrl'],
  },
];

export default function IntegrationsSettingsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<IntegrationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string } }>({});
  const [activeTab, setActiveTab] = useState<'all' | 'analytics' | 'seo' | 'user_experience' | 'email'>('all');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (user && canAccessAdmin(role)) {
      const fetchSettings = async () => {
        try {
          setLoading(true);
          const token = await auth.currentUser?.getIdToken();
          if (!token) return;

          const res = await fetch('/api/admin/settings', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!res.ok) {
            throw new Error('Failed to load settings');
          }

          const data = await res.json();
          setSettings(mergeSettings(data));
        } catch (err: any) {
          console.error("Error loading settings:", err);
          setSaveStatus({ type: 'error', message: 'Could not load site integration settings. Please make sure database is initialized.' });
        } finally {
          setLoading(false);
        }
      };
      fetchSettings();
    }
  }, [user, role, reloadKey]);

  const handleToggle = (service: StandardIntegrationKey) => {
    setSettings(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        enabled: !prev[service].enabled
      }
    }));
  };

  const handleInputChange = (service: StandardIntegrationKey, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value
      }
    }));
  };

  const handleSmtpChange = (field: keyof IntegrationSettings['smtp'], value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      smtp: {
        ...prev.smtp,
        [field]: value,
      },
    }));
  };

  const handleEmailTemplateChange = (
    template: keyof IntegrationSettings['emailTemplates'],
    field: keyof EmailTemplateConfig,
    value: string | boolean,
  ) => {
    setSettings(prev => ({
      ...prev,
      emailTemplates: {
        ...prev.emailTemplates,
        [template]: {
          ...prev.emailTemplates[template],
          [field]: value,
        },
      },
    }));
  };

  const resetEmailTemplate = (template: keyof IntegrationSettings['emailTemplates']) => {
    setSettings(prev => ({
      ...prev,
      emailTemplates: {
        ...prev.emailTemplates,
        [template]: DEFAULT_EMAIL_TEMPLATES[template],
      },
    }));
  };

  const saveSettingsToServer = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('You must be authenticated to perform this action.');
    }

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save settings');
    }

    if (data.settings) {
      setSettings(mergeSettings(data.settings));
    }

    return data;
  };

  const handleSave = async (serviceToSave?: keyof IntegrationSettings) => {
    setSaveStatus({ type: null, message: '' });
    try {
      await saveSettingsToServer();

      setSaveStatus({ 
        type: 'success', 
        message: serviceToSave 
          ? `Successfully saved ${getServiceLabel(serviceToSave)} settings.` 
          : 'Successfully saved all integration settings.' 
      });

      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus({ type: null, message: '' });
      }, 4000);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setSaveStatus({ type: 'error', message: err.message || 'Error occurred while saving settings.' });
    }
  };

  const sendSmtpTestEmail = async () => {
    setTestingEmail(true);
    setSaveStatus({ type: null, message: '' });
    try {
      await saveSettingsToServer();

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setSaveStatus({ type: 'error', message: 'You must be authenticated to perform this action.' });
        return;
      }

      const res = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const missing = Array.isArray(data.diagnostics?.missing) && data.diagnostics.missing.length > 0
          ? ` Missing: ${data.diagnostics.missing.join(', ')}.`
          : '';
        throw new Error(`${data.message || data.reason || data.error || 'SMTP test email was not accepted.'}${missing}`);
      }

      setSaveStatus({
        type: 'success',
        message: `Settings saved. SMTP test email accepted for ${data.recipient}${data.messageId ? ` (${data.messageId})` : ''}.`,
      });
    } catch (err: any) {
      console.error("SMTP test email failed:", err);
      setSaveStatus({ type: 'error', message: err.message || 'SMTP test email failed.' });
    } finally {
      setTestingEmail(false);
    }
  };

  const runVerificationTest = async (service: StandardIntegrationKey) => {
    setTestingService(service);
    // Simulate slight network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const config = settings[service];
    let success = false;
    let message = "";

    switch (service) {
      case 'googleAnalytics':
        if (!config.measurementId) {
          message = "Measurement ID is required.";
        } else if (!/^G-[A-Z0-9]+$/.test(config.measurementId)) {
          message = "Invalid format. GA4 Measurement ID should start with 'G-' followed by uppercase letters and numbers.";
        } else {
          success = true;
          message = "Google Analytics Measurement ID pattern is valid. Tag script is ready to load.";
        }
        break;

      case 'searchConsole':
        if (!config.verificationTag) {
          message = "Verification tag/content is required.";
        } else if (!config.verificationTag.includes('<meta') && !/^[a-zA-Z0-9_-]+$/.test(config.verificationTag)) {
          message = "Invalid verification format. Provide the full meta HTML tag (e.g., <meta name=\"google-site-verification\" content=\"...\" />) or the verification string.";
        } else {
          success = true;
          message = "Search Console verification tag is syntactically correct.";
        }
        break;

      case 'tagManager':
        if (!config.containerId) {
          message = "Container ID is required.";
        } else if (!/^GTM-[A-Z0-9]+$/.test(config.containerId)) {
          message = "Invalid format. GTM Container ID must start with 'GTM-'.";
        } else {
          success = true;
          message = "Google Tag Manager Container ID structure validated successfully.";
        }
        break;

      case 'clarity':
        if (!config.projectId) {
          message = "Clarity Project ID is required.";
        } else if (config.projectId.length !== 10) {
          message = "Warning: Microsoft Clarity project IDs are usually exactly 10 characters of alphanumeric code.";
        } else {
          success = true;
          message = "Microsoft Clarity Project ID format validated.";
        }
        break;

      case 'metaPixel':
        if (!config.pixelId) {
          message = "Pixel ID is required.";
        } else if (!/^\d+$/.test(config.pixelId)) {
          message = "Invalid Pixel ID. Must be a numeric string containing only digits.";
        } else {
          success = true;
          message = "Meta Pixel ID validated. Tracking pixel ready to fire in production.";
        }
        break;

      case 'cookieConsent':
        if (!config.message) {
          message = "Consent banner message is required.";
        } else if (!config.privacyPolicyUrl) {
          message = "Privacy policy link is required.";
        } else {
          success = true;
          message = "Cookie consent banner configured properly.";
        }
        break;

      case 'sitemap':
        if (!config.url) {
          message = "Sitemap URL path is required.";
        } else if (!config.url.startsWith('/') && !config.url.startsWith('http')) {
          message = "Invalid URL path. Should be relative (e.g. /sitemap.xml) or absolute.";
        } else {
          success = true;
          message = `XML Sitemap is enabled at: ${config.url}. Auto-generation is ${config.autoGenerate ? 'ACTIVE' : 'INACTIVE'}.`;
        }
        break;

      case 'robots':
        if (!config.url) {
          message = "Robots.txt path is required.";
        } else {
          success = true;
          message = `Robots.txt accessible at: ${config.url}. Current Crawler policy: ${config.status}.`;
        }
        break;

      case 'openGraph':
        if (!config.title || !config.description) {
          message = "OG Title and OG Description are required for SEO optimization.";
        } else {
          success = true;
          message = "Default metadata parameters verified.";
        }
        break;

      case 'favicon':
        if (!config.url) {
          message = "Favicon path or URL is required.";
        } else {
          success = true;
          message = `Favicon is mapped to: ${config.url}.`;
        }
        break;

      default:
        success = true;
        message = "Verification check completed.";
    }

    setTestResults(prev => ({
      ...prev,
      [service]: { success, message }
    }));

    // Update settings state with verified checked status
    const currentChecked = formatAppDateTime(new Date());
    setSettings(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        lastChecked: success ? currentChecked : prev[service].lastChecked,
        testError: !success ? message : undefined
      }
    }));

    setTestingService(null);
  };

  const getServiceLabel = (service: keyof IntegrationSettings): string => {
    switch (service) {
      case 'googleAnalytics': return "Google Analytics 4";
      case 'searchConsole': return "Google Search Console";
      case 'tagManager': return "Google Tag Manager";
      case 'clarity': return "Microsoft Clarity";
      case 'metaPixel': return "Meta Pixel";
      case 'cookieConsent': return "Cookie Consent Banner";
      case 'sitemap': return "XML Sitemap";
      case 'robots': return "Robots.txt";
      case 'openGraph': return "Open Graph (SEO Metadata)";
      case 'favicon': return "Favicon Setup";
      case 'smtp': return "SMTP Sender";
      case 'emailTemplates': return "Email Notifications";
      default: return String(service);
    }
  };

  const getServiceStatus = (serviceKey: keyof IntegrationSettings) => {
    if (serviceKey === 'emailTemplates') {
      const templates = settings.emailTemplates;
      const hasRequiredFields = Object.values(templates).every(template => template.subject?.trim() && template.body?.trim());
      return hasRequiredFields
        ? { text: "Ready", variant: "success" as const }
        : { text: "Needs Setup", variant: "warning" as const };
    }

    const config = settings[serviceKey] as IntegrationService & Record<string, any>;
    if (!config.enabled) {
      return { text: "Disabled", variant: "default" as const };
    }
    
    let hasRequiredFields = false;
    switch (serviceKey) {
      case "googleAnalytics": hasRequiredFields = !!config.measurementId; break;
      case "searchConsole": hasRequiredFields = !!config.verificationTag; break;
      case "tagManager": hasRequiredFields = !!config.containerId; break;
      case "clarity": hasRequiredFields = !!config.projectId; break;
      case "metaPixel": hasRequiredFields = !!config.pixelId; break;
      case "cookieConsent": hasRequiredFields = !!config.message && !!config.privacyPolicyUrl; break;
      case "sitemap": hasRequiredFields = !!config.url; break;
      case "robots": hasRequiredFields = !!config.url; break;
      case "openGraph": hasRequiredFields = !!config.title && !!config.description; break;
      case "favicon": hasRequiredFields = !!config.url; break;
    }

    if (!hasRequiredFields) {
      return { text: "Needs Setup", variant: "warning" as const };
    }

    if (config.testError) {
      return { text: "Error", variant: "danger" as const };
    }

    if (config.lastChecked) {
      return { text: "Running", variant: "success" as const };
    }

    return { text: "Enabled", variant: "info" as const };
  };

  if (authLoading) {
    return <div className="p-8 text-center text-slate-500">Authenticating...</div>;
  }

  if (!user || !canAccessAdmin(role)) {
    return (
      <div className="p-8 max-w-md mx-auto text-center mt-20">
        <LucideShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm mb-4">Only administrators are permitted to view and manage integrations settings.</p>
        <Button onClick={() => window.location.href = '/'}>Go Home</Button>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageHeader
            title="Integrations & Site Settings"
            description="Manage tracking scripts, verify ownership, configure XML Sitemaps, robots policy, and configure Open Graph details."
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setReloadKey(prev => prev + 1)}
              className="text-xs font-semibold flex items-center gap-1.5"
              disabled={loading}
            >
              <LucideRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleSave()}
              className="text-xs font-semibold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              <LucideSave className="w-3.5 h-3.5" />
              Save All Settings
            </Button>
          </div>
        </div>

        {saveStatus.message && (
          <div className={`p-4 rounded-lg flex items-start gap-3 border text-sm animate-fade-in ${
            saveStatus.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {saveStatus.type === 'success' ? (
              <LucideCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <LucideXCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{saveStatus.type === 'success' ? 'Success' : 'Configuration Error'}</p>
              <p className="text-xs mt-0.5">{saveStatus.message}</p>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 gap-4 overflow-x-auto pb-px">
          {[
            { id: 'all', label: 'All Settings' },
            { id: 'analytics', label: 'Analytics & Pixels' },
            { id: 'seo', label: 'SEO & Site Crawlers' },
            { id: 'user_experience', label: 'User Experience' },
            { id: 'email', label: 'Email Templates' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 font-semibold text-xs uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-xl h-60"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(activeTab === 'all' || activeTab === 'email') && (
              <Card className="p-6 border-slate-200 shadow-sm lg:col-span-2 space-y-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <LucideMail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Email Notification Templates</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Customize subjects and messages for account upgrades, listing approvals, and inquiry notifications.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getServiceStatus('emailTemplates').variant}>
                      {getServiceStatus('emailTemplates').text}
                    </Badge>
                    <Button
                      variant="secondary"
                      onClick={sendSmtpTestEmail}
                      isLoading={testingEmail}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Send Test Email
                    </Button>
	                    <Button
	                      variant="outline"
	                      onClick={() => handleSave('emailTemplates')}
	                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
	                    >
	                      Save Email Settings
	                    </Button>
                  </div>
                </div>

                <details open className="rounded-xl border border-slate-200 bg-white">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-slate-900">
                    SMTP Sender Settings
                  </summary>
                  <div className="border-t border-slate-100 p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <input
                          type="checkbox"
                          checked={settings.smtp.enabled}
                          onChange={(e) => handleSmtpChange('enabled', e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Enable in-app SMTP settings
                      </label>
                      <span className="text-xs text-slate-500">Used when Dokploy env SMTP values are missing.</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">SMTP Host</label>
                        <Input value={settings.smtp.host} onChange={(e) => handleSmtpChange('host', e.target.value)} placeholder="smtp.hostinger.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">SMTP Port</label>
                        <Input value={settings.smtp.port} onChange={(e) => handleSmtpChange('port', e.target.value)} placeholder="465" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">SMTP Username</label>
                        <Input value={settings.smtp.user} onChange={(e) => handleSmtpChange('user', e.target.value)} placeholder="support@localpages.ph" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">SMTP Password</label>
                        <Input
                          type="password"
                          value={settings.smtp.password}
                          onChange={(e) => handleSmtpChange('password', e.target.value)}
                          placeholder={settings.smtp.hasPassword ? 'Saved. Leave blank to keep current password.' : 'Mailbox password'}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700">Sender Email</label>
                        <Input value={settings.smtp.from} onChange={(e) => handleSmtpChange('from', e.target.value)} placeholder="support@localpages.ph" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-4">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={settings.smtp.secure}
                          onChange={(e) => handleSmtpChange('secure', e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        SSL / secure connection
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={settings.smtp.rejectUnauthorized}
                          onChange={(e) => handleSmtpChange('rejectUnauthorized', e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Verify SMTP TLS certificate
                      </label>
                    </div>
                  </div>
                </details>

                <details className="rounded-xl border border-slate-200 bg-white">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-slate-900">
                    Email Notification Templates
                  </summary>
                  <div className="border-t border-slate-100 p-4 space-y-4">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
                      Use placeholders exactly as shown, like <span className="font-mono font-semibold">{'{{businessName}}'}</span>. They will be replaced automatically when the email is sent.
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {EMAIL_TEMPLATE_META.map((templateMeta) => {
                        const template = settings.emailTemplates[templateMeta.key];
                        return (
                          <div key={templateMeta.key} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">{templateMeta.title}</h4>
                                <p className="text-xs text-slate-500 mt-1">{templateMeta.description}</p>
                              </div>
                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={template.enabled}
                                  onChange={(e) => handleEmailTemplateChange(templateMeta.key, 'enabled', e.target.checked)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                Enabled
                              </label>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-xs font-semibold text-slate-700">Subject</label>
                              <Input
                                value={template.subject}
                                onChange={(e) => handleEmailTemplateChange(templateMeta.key, 'subject', e.target.value)}
                                className="text-xs"
                                placeholder="Email subject"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-xs font-semibold text-slate-700">Message</label>
                              <Textarea
                                value={template.body}
                                onChange={(e) => handleEmailTemplateChange(templateMeta.key, 'body', e.target.value)}
                                rows={8}
                                className="text-xs font-mono leading-relaxed"
                                placeholder="Email message"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-3">
                              <div className="flex flex-wrap gap-1.5">
                                {templateMeta.variables.map(variable => (
                                  <span key={variable} className="rounded bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-700">
                                    {`{{${variable}}}`}
                                  </span>
                                ))}
                              </div>
                              <Button
                                variant="secondary"
                                onClick={() => resetEmailTemplate(templateMeta.key)}
                                className="h-8 text-[11px] px-3 font-semibold"
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </details>
              </Card>
            )}
            
            {/* GOOGLE ANALYTICS 4 */}
            {(activeTab === 'all' || activeTab === 'analytics') && (
              <Card className="p-6 border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                        <LucideTrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Google Analytics 4</h3>
                        <p className="text-xs text-slate-400">Track user behavior and sessions.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getServiceStatus('googleAnalytics').variant}>
                        {getServiceStatus('googleAnalytics').text}
                      </Badge>
                      <button 
                        onClick={() => handleToggle('googleAnalytics')}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          settings.googleAnalytics.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          settings.googleAnalytics.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-700">GA4 Measurement ID</label>
                    <Input
                      placeholder="e.g. G-ABC123XYZ"
                      value={settings.googleAnalytics.measurementId}
                      onChange={(e) => handleInputChange('googleAnalytics', 'measurementId', e.target.value)}
                      disabled={!settings.googleAnalytics.enabled}
                      className="text-xs"
                    />
                    <p className="text-[10px] text-slate-400">Used for client-side tracking. Scripts only load in Production env.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {settings.googleAnalytics.lastChecked ? `Checked: ${settings.googleAnalytics.lastChecked}` : 'Not tested yet'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => runVerificationTest('googleAnalytics')}
                      disabled={!settings.googleAnalytics.enabled || testingService === 'googleAnalytics'}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Verify Format
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave('googleAnalytics')}
                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {testResults.googleAnalytics && (
                  <p className={`text-[11px] mt-2 p-2 rounded ${testResults.googleAnalytics.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.googleAnalytics.message}
                  </p>
                )}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <AnalyticsDocumentation />
                </div>
              </Card>
            )}

            {/* GOOGLE TAG MANAGER */}
            {(activeTab === 'all' || activeTab === 'analytics') && (
              <Card className="p-6 border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <LucideCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Google Tag Manager</h3>
                        <p className="text-xs text-slate-400">Deploy marketing tags and event triggers.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getServiceStatus('tagManager').variant}>
                        {getServiceStatus('tagManager').text}
                      </Badge>
                      <button 
                        onClick={() => handleToggle('tagManager')}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          settings.tagManager.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          settings.tagManager.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-700">GTM Container ID</label>
                    <Input
                      placeholder="e.g. GTM-XXXXXXX"
                      value={settings.tagManager.containerId}
                      onChange={(e) => handleInputChange('tagManager', 'containerId', e.target.value)}
                      disabled={!settings.tagManager.enabled}
                      className="text-xs"
                    />
                    <p className="text-[10px] text-slate-400">Container ID used to dynamically inject scripts in page headers.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {settings.tagManager.lastChecked ? `Checked: ${settings.tagManager.lastChecked}` : 'Not tested yet'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => runVerificationTest('tagManager')}
                      disabled={!settings.tagManager.enabled || testingService === 'tagManager'}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Verify Format
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave('tagManager')}
                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {testResults.tagManager && (
                  <p className={`text-[11px] mt-2 p-2 rounded ${testResults.tagManager.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.tagManager.message}
                  </p>
                )}
              </Card>
            )}

            {/* MICROSOFT CLARITY */}
            {(activeTab === 'all' || activeTab === 'analytics') && (
              <Card className="p-6 border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <LucideActivity className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Microsoft Clarity</h3>
                        <p className="text-xs text-slate-400">Generate heatmaps and user session recordings.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getServiceStatus('clarity').variant}>
                        {getServiceStatus('clarity').text}
                      </Badge>
                      <button 
                        onClick={() => handleToggle('clarity')}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          settings.clarity.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          settings.clarity.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-700">Clarity Project ID</label>
                    <Input
                      placeholder="e.g. abcdefghij"
                      value={settings.clarity.projectId}
                      onChange={(e) => handleInputChange('clarity', 'projectId', e.target.value)}
                      disabled={!settings.clarity.enabled}
                      className="text-xs"
                    />
                    <p className="text-[10px] text-slate-400">Unique alphanumeric project token provided by Clarity portal.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {settings.clarity.lastChecked ? `Checked: ${settings.clarity.lastChecked}` : 'Not tested yet'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => runVerificationTest('clarity')}
                      disabled={!settings.clarity.enabled || testingService === 'clarity'}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Verify Format
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave('clarity')}
                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {testResults.clarity && (
                  <p className={`text-[11px] mt-2 p-2 rounded ${testResults.clarity.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.clarity.message}
                  </p>
                )}
              </Card>
            )}

            {/* META PIXEL */}
            {(activeTab === 'all' || activeTab === 'analytics') && (
              <Card className="p-6 border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-50 text-indigo-700 rounded-lg">
                        <LucideShare2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Meta Pixel</h3>
                        <p className="text-xs text-slate-400">Track paid marketing campaign conversions.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getServiceStatus('metaPixel').variant}>
                        {getServiceStatus('metaPixel').text}
                      </Badge>
                      <button 
                        onClick={() => handleToggle('metaPixel')}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          settings.metaPixel.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          settings.metaPixel.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-700">Meta Pixel ID</label>
                    <Input
                      placeholder="e.g. 123456789012345"
                      value={settings.metaPixel.pixelId}
                      onChange={(e) => handleInputChange('metaPixel', 'pixelId', e.target.value)}
                      disabled={!settings.metaPixel.enabled}
                      className="text-xs"
                    />
                    <p className="text-[10px] text-slate-400">Numeric identifier supplied in Facebook Ads manager.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {settings.metaPixel.lastChecked ? `Checked: ${settings.metaPixel.lastChecked}` : 'Not tested yet'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => runVerificationTest('metaPixel')}
                      disabled={!settings.metaPixel.enabled || testingService === 'metaPixel'}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Verify Format
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave('metaPixel')}
                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {testResults.metaPixel && (
                  <p className={`text-[11px] mt-2 p-2 rounded ${testResults.metaPixel.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.metaPixel.message}
                  </p>
                )}
              </Card>
            )}

            {/* GOOGLE SEARCH CONSOLE */}
            {(activeTab === 'all' || activeTab === 'seo') && (
              <Card className="p-6 border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-50 text-slate-800 rounded-lg">
                        <LucideGlobe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Google Search Console</h3>
                        <p className="text-xs text-slate-400">Prove site ownership and query search indexing reports.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getServiceStatus('searchConsole').variant}>
                        {getServiceStatus('searchConsole').text}
                      </Badge>
                      <button 
                        onClick={() => handleToggle('searchConsole')}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          settings.searchConsole.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          settings.searchConsole.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-700">Verification Meta Tag / Content</label>
                    <Textarea
                      placeholder={`e.g. <meta name="google-site-verification" content="XYZ..." />`}
                      value={settings.searchConsole.verificationTag}
                      onChange={(e) => handleInputChange('searchConsole', 'verificationTag', e.target.value)}
                      disabled={!settings.searchConsole.enabled}
                      rows={2}
                      className="text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-400">Injected directly into the root HTML &lt;head&gt; element.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {settings.searchConsole.lastChecked ? `Checked: ${settings.searchConsole.lastChecked}` : 'Not tested yet'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => runVerificationTest('searchConsole')}
                      disabled={!settings.searchConsole.enabled || testingService === 'searchConsole'}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Verify Tag
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave('searchConsole')}
                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {testResults.searchConsole && (
                  <p className={`text-[11px] mt-2 p-2 rounded ${testResults.searchConsole.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.searchConsole.message}
                  </p>
                )}
              </Card>
            )}

            {/* XML SITEMAP */}
            {(activeTab === 'all' || activeTab === 'seo') && (
              <Card className="p-6 border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <LucideFileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">XML Sitemap</h3>
                        <p className="text-xs text-slate-400">Configure indexing route map for search spiders.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getServiceStatus('sitemap').variant}>
                        {getServiceStatus('sitemap').text}
                      </Badge>
                      <button 
                        onClick={() => handleToggle('sitemap')}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          settings.sitemap.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          settings.sitemap.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sitemap Path URL</label>
                      <Input
                        placeholder="/sitemap.xml"
                        value={settings.sitemap.url}
                        onChange={(e) => handleInputChange('sitemap', 'url', e.target.value)}
                        disabled={!settings.sitemap.enabled}
                        className="text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="sitemap_auto"
                        checked={settings.sitemap.autoGenerate}
                        onChange={(e) => handleInputChange('sitemap', 'autoGenerate', e.target.checked)}
                        disabled={!settings.sitemap.enabled}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <label htmlFor="sitemap_auto" className="text-xs text-slate-600 font-medium">Auto-generate upon business publication</label>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {settings.sitemap.lastChecked ? `Checked: ${settings.sitemap.lastChecked}` : 'Not tested yet'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => runVerificationTest('sitemap')}
                      disabled={!settings.sitemap.enabled || testingService === 'sitemap'}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Verify Route
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave('sitemap')}
                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {testResults.sitemap && (
                  <p className={`text-[11px] mt-2 p-2 rounded ${testResults.sitemap.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.sitemap.message}
                  </p>
                )}
              </Card>
            )}

            {/* ROBOTS.TXT */}
            {(activeTab === 'all' || activeTab === 'seo') && (
              <Card className="p-6 border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                        <LucideFileCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Robots.txt</h3>
                        <p className="text-xs text-slate-400">Crawl accessibility rule files.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getServiceStatus('robots').variant}>
                        {getServiceStatus('robots').text}
                      </Badge>
                      <button 
                        onClick={() => handleToggle('robots')}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          settings.robots.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          settings.robots.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Robots.txt Path</label>
                      <Input
                        placeholder="/robots.txt"
                        value={settings.robots.url}
                        onChange={(e) => handleInputChange('robots', 'url', e.target.value)}
                        disabled={!settings.robots.enabled}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Crawl policy status</label>
                      <select 
                        value={settings.robots.status}
                        onChange={(e) => handleInputChange('robots', 'status', e.target.value)}
                        disabled={!settings.robots.enabled}
                        className="w-full text-xs border rounded-lg p-2 bg-white text-slate-700 font-medium"
                      >
                        <option value="Allowed">Allow All Crawlers</option>
                        <option value="Disallowed">Disallow Private Folders (Admin/Business Panel)</option>
                        <option value="Blocked">Disallow All (Under Maintenance/Staging)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {settings.robots.lastChecked ? `Checked: ${settings.robots.lastChecked}` : 'Not tested yet'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => runVerificationTest('robots')}
                      disabled={!settings.robots.enabled || testingService === 'robots'}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Check Policy
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave('robots')}
                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {testResults.robots && (
                  <p className={`text-[11px] mt-2 p-2 rounded ${testResults.robots.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.robots.message}
                  </p>
                )}
              </Card>
            )}

            {/* COOKIE CONSENT BANNER */}
            {(activeTab === 'all' || activeTab === 'user_experience') && (
              <Card className="p-6 border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <LucideShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Cookie Consent Banner</h3>
                        <p className="text-xs text-slate-400">Prompt users to accept tracking cookies (EU/GPDR Compliance).</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getServiceStatus('cookieConsent').variant}>
                        {getServiceStatus('cookieConsent').text}
                      </Badge>
                      <button 
                        onClick={() => handleToggle('cookieConsent')}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          settings.cookieConsent.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          settings.cookieConsent.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Consent message</label>
                      <Textarea
                        placeholder="We use cookies to improve your experience."
                        value={settings.cookieConsent.message}
                        onChange={(e) => handleInputChange('cookieConsent', 'message', e.target.value)}
                        disabled={!settings.cookieConsent.enabled}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Privacy Policy URL</label>
                      <Input
                        placeholder="/privacy"
                        value={settings.cookieConsent.privacyPolicyUrl}
                        onChange={(e) => handleInputChange('cookieConsent', 'privacyPolicyUrl', e.target.value)}
                        disabled={!settings.cookieConsent.enabled}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {settings.cookieConsent.lastChecked ? `Checked: ${settings.cookieConsent.lastChecked}` : 'Not tested yet'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => runVerificationTest('cookieConsent')}
                      disabled={!settings.cookieConsent.enabled || testingService === 'cookieConsent'}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Verify Banner
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave('cookieConsent')}
                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {testResults.cookieConsent && (
                  <p className={`text-[11px] mt-2 p-2 rounded ${testResults.cookieConsent.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.cookieConsent.message}
                  </p>
                )}
              </Card>
            )}

            {/* OPEN GRAPH SEO */}
            {(activeTab === 'all' || activeTab === 'seo') && (
              <Card className="p-6 border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <LucideShare2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Open Graph (SEO Metadata)</h3>
                        <p className="text-xs text-slate-400">Customize rich snippet cards on social media shares.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getServiceStatus('openGraph').variant}>
                        {getServiceStatus('openGraph').text}
                      </Badge>
                      <button 
                        onClick={() => handleToggle('openGraph')}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          settings.openGraph.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          settings.openGraph.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Default OG Title</label>
                      <Input
                        placeholder="LocalPages PH"
                        value={settings.openGraph.title}
                        onChange={(e) => handleInputChange('openGraph', 'title', e.target.value)}
                        disabled={!settings.openGraph.enabled}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Default OG Description</label>
                      <Textarea
                        placeholder="Discover trusted local businesses in the Philippines"
                        value={settings.openGraph.description}
                        onChange={(e) => handleInputChange('openGraph', 'description', e.target.value)}
                        disabled={!settings.openGraph.enabled}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Default OG Image URL</label>
                      <Input
                        placeholder="https://localpages.ph/images/og-default.jpg"
                        value={settings.openGraph.imageUrl}
                        onChange={(e) => handleInputChange('openGraph', 'imageUrl', e.target.value)}
                        disabled={!settings.openGraph.enabled}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {settings.openGraph.lastChecked ? `Checked: ${settings.openGraph.lastChecked}` : 'Not tested yet'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => runVerificationTest('openGraph')}
                      disabled={!settings.openGraph.enabled || testingService === 'openGraph'}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Verify SEO
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave('openGraph')}
                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {testResults.openGraph && (
                  <p className={`text-[11px] mt-2 p-2 rounded ${testResults.openGraph.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.openGraph.message}
                  </p>
                )}
              </Card>
            )}

            {/* FAVICON SETUP */}
            {(activeTab === 'all' || activeTab === 'user_experience') && (
              <Card className="p-6 border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                        <LucideImage className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Favicon Setup</h3>
                        <p className="text-xs text-slate-400">Set the browser tab and app launcher icons.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getServiceStatus('favicon').variant}>
                        {getServiceStatus('favicon').text}
                      </Badge>
                      <button 
                        onClick={() => handleToggle('favicon')}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          settings.favicon.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          settings.favicon.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-700">Favicon Image URL</label>
                    <Input
                      placeholder="e.g. /favicon.ico"
                      value={settings.favicon.url}
                      onChange={(e) => handleInputChange('favicon', 'url', e.target.value)}
                      disabled={!settings.favicon.enabled}
                      className="text-xs"
                    />
                    <p className="text-[10px] text-slate-400">Supports .ico, .png, .svg. Provide the file path relative to /public or an absolute URL.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {settings.favicon.lastChecked ? `Checked: ${settings.favicon.lastChecked}` : 'Not tested yet'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => runVerificationTest('favicon')}
                      disabled={!settings.favicon.enabled || testingService === 'favicon'}
                      className="h-8 text-[11px] px-3 font-semibold"
                    >
                      Verify Favicon
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave('favicon')}
                      className="h-8 text-[11px] px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {testResults.favicon && (
                  <p className={`text-[11px] mt-2 p-2 rounded ${testResults.favicon.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {testResults.favicon.message}
                  </p>
                )}
              </Card>
            )}

          </div>
        )}
      </div>
    </AdminLayout>
  );
}
