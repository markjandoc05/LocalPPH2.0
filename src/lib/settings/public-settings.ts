import type { IntegrationSettings } from './settings-service';

export interface PublicIntegrationSettings {
  googleAnalytics: { enabled: boolean; measurementId: string };
  searchConsole: { enabled: boolean; verificationTag: string };
  tagManager: { enabled: boolean; containerId: string };
  clarity: { enabled: boolean; projectId: string };
  metaPixel: { enabled: boolean; pixelId: string };
  cookieConsent: { enabled: boolean; message: string; privacyPolicyUrl: string };
  sitemap: { enabled: boolean; url: string; autoGenerate: boolean };
  robots: { enabled: boolean; url: string; status: string };
  openGraph: { enabled: boolean; title: string; description: string; imageUrl: string };
  favicon: { enabled: boolean; url: string };
}

const publicString = (value: unknown): string => typeof value === 'string' ? value : '';

// Select individual public fields so new settings and nested private fields stay private.
export const toPublicSettings = (
  settings: Partial<IntegrationSettings> | null | undefined,
): PublicIntegrationSettings => ({
  googleAnalytics: {
    enabled: settings?.googleAnalytics?.enabled === true,
    measurementId: publicString(settings?.googleAnalytics?.measurementId),
  },
  searchConsole: {
    enabled: settings?.searchConsole?.enabled === true,
    verificationTag: publicString(settings?.searchConsole?.verificationTag),
  },
  tagManager: {
    enabled: settings?.tagManager?.enabled === true,
    containerId: publicString(settings?.tagManager?.containerId),
  },
  clarity: {
    enabled: settings?.clarity?.enabled === true,
    projectId: publicString(settings?.clarity?.projectId),
  },
  metaPixel: {
    enabled: settings?.metaPixel?.enabled === true,
    pixelId: publicString(settings?.metaPixel?.pixelId),
  },
  cookieConsent: {
    enabled: settings?.cookieConsent?.enabled === true,
    message: publicString(settings?.cookieConsent?.message),
    privacyPolicyUrl: publicString(settings?.cookieConsent?.privacyPolicyUrl),
  },
  sitemap: {
    enabled: settings?.sitemap?.enabled === true,
    url: publicString(settings?.sitemap?.url),
    autoGenerate: settings?.sitemap?.autoGenerate === true,
  },
  robots: {
    enabled: settings?.robots?.enabled === true,
    url: publicString(settings?.robots?.url),
    status: publicString(settings?.robots?.status),
  },
  openGraph: {
    enabled: settings?.openGraph?.enabled === true,
    title: publicString(settings?.openGraph?.title),
    description: publicString(settings?.openGraph?.description),
    imageUrl: publicString(settings?.openGraph?.imageUrl),
  },
  favicon: {
    enabled: settings?.favicon?.enabled === true,
    url: publicString(settings?.favicon?.url),
  },
});
