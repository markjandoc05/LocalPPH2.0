import firebaseConfig from '../../../firebase-applet-config.json';

export const validateEnvironment = () => {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE || "firebase";
  const nodeEnv = process.env.NODE_ENV;

  const isConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "dummy-api-key-for-build";
  const missingKeys = isConfigured ? [] : ["apiKey"];

  const warnings: string[] = [];

  if (nodeEnv === "production" && mode === "mock") {
    warnings.push(
      "CRITICAL: Application is running in production mode but using MOCK data. Do not deploy with mock data.",
    );
    console.warn(
      "⚠️ CRITICAL WARNING: Running in production with NEXT_PUBLIC_DATA_MODE=mock. This is unsafe and should not be deployed to end users.",
    );
  }

  if (mode === "firebase" && !isConfigured) {
    warnings.push(
      "Data mode is set to firebase but Firebase configuration keys are missing.",
    );
  }

  return {
    isConfigured,
    missingKeys,
    warnings,
    currentDataMode: mode,
    isProduction: nodeEnv === "production",
  };
};
