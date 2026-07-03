import { mockProvider } from "./mock-provider";
import { firebaseProvider } from "./firebase-provider";
import { DataProvider } from "./types";
import { validateEnvironment } from "../config/env";

const dataMode = process.env.NEXT_PUBLIC_DATA_MODE || "mock";
const envValidation = validateEnvironment();

export const provider: DataProvider =
  dataMode === "firebase" ? firebaseProvider : mockProvider;

if (dataMode === "firebase") {
  console.log("Firebase Data Connect mode enabled. Using real provider.");
} else {
  console.log("Mock mode enabled. Using mock provider.");
  if (envValidation.isProduction) {
    console.error(
      "🚨 ALERT: Running in production with mock data provider! 🚨",
    );
  }
}
