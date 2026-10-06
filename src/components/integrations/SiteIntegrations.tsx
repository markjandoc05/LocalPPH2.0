'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PublicIntegrationSettings } from '@/lib/settings/public-settings';

// HTML Head Injection & Script Loading Helpers (declared at top-level to satisfy linter hoisting)

const injectSearchConsole = (metaHtml: string) => {
  try {
    if (document.getElementById('google-search-console-meta')) return;
    
    const container = document.createElement('div');
    container.id = 'google-search-console-meta';
    container.innerHTML = metaHtml.trim();
    const metaNode = container.firstElementChild;
    if (metaNode) {
      metaNode.id = 'google-search-console-meta';
      document.head.appendChild(metaNode);
    }
  } catch (err) {
    console.error("Failed to inject Search Console meta tag:", err);
  }
};

const injectFavicon = (url: string) => {
  try {
    let link = document.getElementById('localpages-favicon') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'localpages-favicon';
      document.head.appendChild(link);
    }
    link.rel = 'icon';
    link.href = url;
  } catch (err) {
    console.error("Failed to inject favicon:", err);
  }
};

const loadGA4 = (id: string) => {
  if (window.hasOwnProperty('gtag_initialized')) return;
  (window as any).gtag_initialized = true;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}', { page_path: window.location.pathname });
  `;
  document.head.appendChild(script2);
};

const loadAdSense = (publisherId: string) => {
  if (document.getElementById('localpages-adsense-script')) return;

  const script = document.createElement('script');
  script.id = 'localpages-adsense-script';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
  document.head.appendChild(script);
};

const loadGTM = (id: string) => {
  if (window.hasOwnProperty('gtm_initialized')) return;
  (window as any).gtm_initialized = true;

  const script = document.createElement('script');
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${id}');
  `;
  document.head.appendChild(script);
};

const loadClarity = (id: string) => {
  if (window.hasOwnProperty('clarity_initialized')) return;
  (window as any).clarity_initialized = true;

  const script = document.createElement('script');
  script.innerHTML = `
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script","${id}");
  `;
  document.head.appendChild(script);
};

const loadMetaPixel = (id: string) => {
  if (window.hasOwnProperty('fb_pixel_initialized')) return;
  (window as any).fb_pixel_initialized = true;

  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${id}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
};

export default function SiteIntegrations() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;
  const [settings, setSettings] = useState<PublicIntegrationSettings | null>(null);
  
  // Lazy-initialize consentGiven synchronously to prevent unnecessary useEffect re-renders
  const [consentGiven, setConsentGiven] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const consent = localStorage.getItem('localpages_cookie_consent');
      if (consent === 'accepted') return true;
      if (consent === 'declined') return false;
    } catch (err) {
      console.error("Local storage error:", err);
    }
    return null;
  });

  useEffect(() => {
    if (isAdminRoute) return;

    // 1. Fetch public settings
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setSettings(data);
          
          // Inject Search Console tag if enabled
          if (data.searchConsole?.enabled && data.searchConsole.verificationTag) {
            injectSearchConsole(data.searchConsole.verificationTag);
          }
          
          // Inject Favicon if enabled
          if (data.favicon?.enabled && data.favicon.url) {
            injectFavicon(data.favicon.url);
          }
        }
      })
      .catch(err => console.error("Error loading public settings:", err));
  }, [isAdminRoute]);

  useEffect(() => {
    if (!settings || isAdminRoute) return;

    // Only load tracking scripts if consent is accepted (or if consent banner is disabled!)
    const isConsentApproved = !settings.cookieConsent?.enabled || consentGiven === true;
    const isProd = process.env.NODE_ENV === 'production';

    // Analytics and Pixels should load ONLY in production environment (per instruction)
    if (isConsentApproved && isProd) {
      // 1. Google Analytics 4
      if (settings.googleAnalytics?.enabled && settings.googleAnalytics.measurementId) {
        loadGA4(settings.googleAnalytics.measurementId);
      }

      // 2. Google Tag Manager
      if (settings.tagManager?.enabled && settings.tagManager.containerId) {
        loadGTM(settings.tagManager.containerId);
      }

      // 3. Microsoft Clarity
      if (settings.clarity?.enabled && settings.clarity.projectId) {
        loadClarity(settings.clarity.projectId);
      }

      // 4. Meta Pixel
      if (settings.metaPixel?.enabled && settings.metaPixel.pixelId) {
        loadMetaPixel(settings.metaPixel.pixelId);
      }

      if (settings.googleAdSense?.enabled && settings.googleAdSense.publisherId) {
        loadAdSense(settings.googleAdSense.publisherId);
      }
    }
  }, [settings, consentGiven, isAdminRoute]);

  const handleAccept = () => {
    try {
      localStorage.setItem('localpages_cookie_consent', 'accepted');
    } catch (err) {
      console.error(err);
    }
    setConsentGiven(true);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('localpages_cookie_consent', 'declined');
    } catch (err) {
      console.error(err);
    }
    setConsentGiven(false);
  };

  // Derive banner visibility dynamically during render instead of putting it in state!
  const showBanner = !isAdminRoute && settings?.cookieConsent?.enabled && consentGiven === null;

  if (!showBanner || !settings?.cookieConsent?.enabled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0C0C1C] text-white border-t border-gray-800 p-4 md:px-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
      <div className="text-xs md:text-sm text-gray-300 max-w-3xl text-center md:text-left">
        {settings.cookieConsent.message}
        {settings.cookieConsent.privacyPolicyUrl && (
          <Link href={settings.cookieConsent.privacyPolicyUrl} className="text-blue-400 hover:underline ml-1 font-semibold">
            Learn more in our Privacy Policy
          </Link>
        )}
      </div>
      <div className="flex gap-3 w-full md:w-auto justify-center">
        <button 
          onClick={handleDecline} 
          className="px-4 py-1.5 text-xs font-semibold rounded bg-transparent text-gray-400 hover:text-white transition-colors"
        >
          Decline
        </button>
        <button 
          onClick={handleAccept} 
          className="px-5 py-1.5 text-xs font-bold rounded bg-[#2563EB] hover:bg-blue-700 text-white transition-colors shadow-sm"
        >
          Accept Cookies
        </button>
      </div>
    </div>
  );
}
