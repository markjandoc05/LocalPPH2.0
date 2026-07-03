import { DataProvider } from "./types";
import { clientProvider } from "./client-provider";

// Use a proxy to handle server-side vs client-side switching with dynamic imports
// to prevent bundling server-only dependencies (like pg/drizzle) in the browser.
export const firebaseProvider: DataProvider = new Proxy({} as DataProvider, {
  get(target, prop: keyof DataProvider) {
    return async (...args: any[]) => {
      if (typeof window === "undefined") {
        // SERVER SIDE
        // We use a dynamic import here to ensure the database-provider (and pg/drizzle)
        // are only loaded on the server.
        const { databaseProvider } = await import("./database-provider");
        return (databaseProvider as any)[prop](...args);
      } else {
        // CLIENT SIDE
        return (clientProvider as any)[prop](...args);
      }
    };
  },
});
