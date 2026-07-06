import firebaseConfig from '../../../firebase-applet-config.json';

export const validateEnvironment = () => {
  const mode = "firebase";
  const nodeEnv = process.env.NODE_ENV;

  const isConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "dummy-api-key-for-build";
  const missingKeys = isConfigured ? [] : ["apiKey"];

  const warnings: string[] = [];

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
    isProduction: true,
  };
};
