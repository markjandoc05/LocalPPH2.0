import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

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
}

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
  favicon: { enabled: true, url: "/favicon.ico" }
};

const MOCK_FILE_PATH = path.join(process.cwd(), "public", "settings-mock.json");

export async function getSettings(): Promise<IntegrationSettings> {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE || "firebase";
  if (mode === "mock") {
    try {
      if (fs.existsSync(MOCK_FILE_PATH)) {
        const raw = fs.readFileSync(MOCK_FILE_PATH, "utf-8");
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.error("Failed to read mock settings file, using defaults:", e);
    }
    return DEFAULT_SETTINGS;
  }

  // Real Database mode
  try {
    const record = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, "integrations"),
    });
    if (record) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(record.value) };
    }
  } catch (error) {
    console.error("Failed to fetch settings from DB, returning defaults:", error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: IntegrationSettings): Promise<void> {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE || "firebase";
  const jsonStr = JSON.stringify(settings);

  if (mode === "mock") {
    try {
      const dir = path.dirname(MOCK_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(MOCK_FILE_PATH, jsonStr, "utf-8");
      return;
    } catch (e) {
      console.error("Failed to save mock settings file:", e);
      throw new Error("Failed to save mock settings.");
    }
  }

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
