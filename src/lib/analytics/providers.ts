import { AnalyticsEventParams, AnalyticsProvider, PageParams } from "./types";

interface WindowWithGtag extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

// Google Analytics 4 Provider
export class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = "GoogleAnalytics";
  private measurementId: string | null = null;
  private initialized = false;

  initialize(measurementId?: string): void {
    if (typeof window === "undefined") return;
    const mId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    
    if (!mId) {
      console.warn("GA4 Measurement ID not found. Google Analytics will not be initialized.");
      return;
    }

    this.measurementId = mId;

    const win = window as WindowWithGtag;
    if (win.gtag) {
      this.initialized = true;
      return;
    }

    // Initialize dataLayer and gtag function
    win.dataLayer = win.dataLayer || [];
    win.gtag = function (...args: unknown[]) {
      if (win.dataLayer) {
        win.dataLayer.push(args);
      }
    };

    // Prevent duplicate page_views by disabling default config pageview tracking since we track it manually
    win.gtag("js", new Date());
    win.gtag("config", mId, {
      send_page_view: false,
    });

    // Inject the global tracking script tag
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${mId}`;
    document.head.appendChild(script);

    this.initialized = true;
  }

  trackPage(params: PageParams): void {
    if (typeof window === "undefined" || !this.initialized || !this.measurementId) return;

    const win = window as WindowWithGtag;
    if (win.gtag) {
      // Send dynamic page_view with custom dimensions (page_type, category, location metadata, etc.)
      win.gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        ...params,
      });
    }
  }

  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    if (typeof window === "undefined" || !this.initialized || !this.measurementId) return;

    const win = window as WindowWithGtag;
    if (win.gtag) {
      win.gtag("event", eventName, params || {});
    }
  }
}

// Microsoft Clarity Provider (Staged & Ready)
export class MicrosoftClarityProvider implements AnalyticsProvider {
  name = "MicrosoftClarity";
  private initialized = false;

  initialize(projectId?: string): void {
    if (typeof window === "undefined") return;
    const pId = projectId || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    if (!pId) return;

    // Inject Clarity script
    const script = document.createElement("script");
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window,document,"clarity","script","${pId}");
    `;
    document.head.appendChild(script);
    this.initialized = true;
  }

  trackPage(params: PageParams): void {
    if (!this.initialized) return;
    // Clarity handles page views automatically, but we can set custom tags if desired
    const clarity = (window as any).clarity as (...args: unknown[]) => void;
    if (typeof clarity === "function") {
      clarity("set", "page_type", params.page_type);
    }
  }

  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    if (!this.initialized) return;
    const clarity = (window as any).clarity as (...args: unknown[]) => void;
    if (typeof clarity === "function") {
      clarity("event", eventName, params || {});
    }
  }
}

// Meta Pixel Provider (Staged & Ready)
export class MetaPixelProvider implements AnalyticsProvider {
  name = "MetaPixel";
  private initialized = false;

  initialize(pixelId?: string): void {
    if (typeof window === "undefined") return;
    const pId = pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (!pId) return;

    const fbq = function (...args: unknown[]) {
      const q = (fbq as any).queue as unknown[];
      q.push(args);
    };
    fbq.queue = [] as unknown[];
    fbq.loaded = true;
    fbq.version = "2.0";

    (window as any).fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    fbq("init", pId);
    this.initialized = true;
  }

  trackPage(params: PageParams): void {
    if (!this.initialized) return;
    const fbq = (window as any).fbq as (...args: unknown[]) => void;
    if (typeof fbq === "function") {
      fbq("track", "PageView", params);
    }
  }

  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    if (!this.initialized) return;
    const fbq = (window as any).fbq as (...args: unknown[]) => void;
    if (typeof fbq === "function") {
      fbq("trackCustom", eventName, params || {});
    }
  }
}

// Additional Provider placeholders to satisfy Requirement 8 (Future Ready)

export class BigQueryProvider implements AnalyticsProvider {
  name = "BigQuery";
  initialize(): void {
    // BigQuery loading stub
  }
  trackPage(params: PageParams): void {
    // Proxy page tracking data to database or backend server for BigQuery ingestion
  }
  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    // Proxy event tracking data to backend
  }
}

export class TikTokPixelProvider implements AnalyticsProvider {
  name = "TikTokPixel";
  initialize(): void {
    // TikTok Pixel load stub
  }
  trackPage(): void {}
  trackEvent(): void {}
}

export class LinkedInInsightProvider implements AnalyticsProvider {
  name = "LinkedInInsight";
  initialize(): void {
    // LinkedIn load stub
  }
  trackPage(): void {}
  trackEvent(): void {}
}
