import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SiteIntegrations from "@/components/integrations/SiteIntegrations";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";
import { SITE_SOCIAL_IMAGE, SITE_URL } from "@/lib/seo/metadata";
import { generateSiteJsonLd } from "@/lib/seo/jsonld";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LocalPages.ph | Philippine Business Directory",
  description: "Philippine Business Directory and AI-search-ready Business Data Platform",
  openGraph: {
    title: "LocalPages.ph | Philippine Business Directory",
    description: "Find trusted local businesses, services, restaurants, clinics, shops, and more across the Philippines.",
    url: SITE_URL,
    siteName: "LocalPages.ph",
    locale: "en_PH",
    type: "website",
    images: [
      {
        url: SITE_SOCIAL_IMAGE,
        width: 1161,
        height: 630,
        alt: "LocalPages.ph - Find Trusted Local Businesses in the Philippines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LocalPages.ph | Philippine Business Directory",
    description: "Find trusted local businesses, services, restaurants, clinics, shops, and more across the Philippines.",
    images: [SITE_SOCIAL_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteJsonLd = generateSiteJsonLd();

  return (
    <html lang="en" className={`${inter.variable} antialiased text-slate-900 bg-[#F8FAFC]`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white bg-[#F8FAFC]">
        <AuthProvider>
          <Header />
          <ProfileCompletionGuard />
          <AnalyticsTracker />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <SiteIntegrations />
        </AuthProvider>
      </body>
    </html>
  );
}
