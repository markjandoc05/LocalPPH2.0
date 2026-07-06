import { AnalyticsEventParams, AnalyticsProvider, PageParams } from "./types";
import {
  GoogleAnalyticsProvider,
  MicrosoftClarityProvider,
  MetaPixelProvider,
  BigQueryProvider,
  TikTokPixelProvider,
  LinkedInInsightProvider,
} from "./providers";

class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private isInitialized = false;
  private isProduction = true;

  constructor() {
    // Register future-ready providers
    this.providers = [
      new GoogleAnalyticsProvider(),
      new MicrosoftClarityProvider(),
      new MetaPixelProvider(),
      new BigQueryProvider(),
      new TikTokPixelProvider(),
      new LinkedInInsightProvider(),
    ];
  }

  /**
   * Initializes registered analytics providers.
   * Runs only in production (unless forced) and only client-side.
   */
  public initialize(): void {
    if (typeof window === "undefined" || this.isInitialized) return;

    if (!this.isProduction) {
      console.log("📊 [Analytics] Running in development mode. Real providers are disabled. All tracking calls will log to console.");
      this.isInitialized = true;
      return;
    }

    // Initialize GA4
    const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (gaMeasurementId) {
      const gaProvider = this.providers.find(p => p.name === "GoogleAnalytics");
      if (gaProvider) {
        gaProvider.initialize(gaMeasurementId);
      }
    }

    // Initialize Microsoft Clarity
    const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    if (clarityProjectId) {
      const clarityProvider = this.providers.find(p => p.name === "MicrosoftClarity");
      if (clarityProvider) {
        clarityProvider.initialize(clarityProjectId);
      }
    }

    // Initialize Meta Pixel
    const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (metaPixelId) {
      const metaProvider = this.providers.find(p => p.name === "MetaPixel");
      if (metaProvider) {
        metaProvider.initialize(metaPixelId);
      }
    }

    this.isInitialized = true;
    console.log("📊 [Analytics] Initialized GA4 and other production providers successfully.");
  }

  /**
   * Track page views across all active providers.
   */
  public trackPage(params: PageParams): void {
    if (typeof window === "undefined") return;

    // Ensure service is initialized
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.isProduction) {
      console.group(`📊 [Analytics Pageview] -> ${params.page_type}`);
      console.log("Parameters:", params);
      console.log("Page URL:", window.location.href);
      console.groupEnd();
      return;
    }

    // Forward to active providers
    this.providers.forEach(provider => {
      try {
        provider.trackPage(params);
      } catch (err) {
        console.error(`Error in ${provider.name} provider trackPage:`, err);
      }
    });
  }

  /**
   * Track user interaction events across all active providers.
   */
  public trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    if (typeof window === "undefined") return;

    // Ensure service is initialized
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.isProduction) {
      console.group(`📊 [Analytics Event] -> ${eventName}`);
      console.log("Parameters:", params);
      console.groupEnd();
      return;
    }

    // Forward to active providers
    this.providers.forEach(provider => {
      try {
        provider.trackEvent(eventName, params);
      } catch (err) {
        console.error(`Error in ${provider.name} provider trackEvent:`, err);
      }
    });
  }
}

// Export a singleton instance of the service
const analytics = new AnalyticsService();

export default analytics;

// Re-export convenient high-level functions
export function trackPage(params: PageParams): void {
  analytics.trackPage(params);
}

export function trackEvent(eventName: string, params?: AnalyticsEventParams): void {
  analytics.trackEvent(eventName, params);
}
