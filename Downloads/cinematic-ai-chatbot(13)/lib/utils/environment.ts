/**
 * Safe environment utilities for client and server components
 */

// Client-safe environment checks
export const isDevelopment =
  process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
  (typeof window !== "undefined" && window.location.hostname === "localhost")

export const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production"

export const isTest = process.env.NEXT_PUBLIC_NODE_ENV === "test"

// Helper to get environment-specific values
export function getEnvValue<T>(development: T, production: T, test?: T): T {
  if (isTest && test !== undefined) return test
  return isDevelopment ? development : production
}
