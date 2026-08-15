/**
 * cypress/support/e2e.ts
 * Entry point untuk support files Cypress.
 */

// Import custom commands
import "./commands";

// Global configuration untuk semua tests
Cypress.on("uncaught:exception", (err) => {
  // Abaikan error Prisma timeout yang tidak kritis untuk UI test
  if (
    err.message.includes("P2024") ||
    err.message.includes("PrismaClientKnownRequestError") ||
    err.message.includes("connection pool")
  ) {
    return false;
  }
  // Abaikan Next.js hydration errors
  if (err.message.includes("hydration") || err.message.includes("Hydration")) {
    return false;
  }
  return true;
});

export {};
