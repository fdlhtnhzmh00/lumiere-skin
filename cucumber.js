/**
 * cucumber.js — Konfigurasi Cucumber BDD untuk LUMIÈRE SKIN
 *
 * Menggunakan:
 * - @cucumber/cucumber v13
 * - ts-node untuk kompilasi TypeScript
 * - tsconfig.bdd.json untuk path resolution
 *
 * Jalankan dengan: npm run test:bdd
 */

const config = {
  default: {
    // Step definitions — TypeScript files
    require: ["tests/bdd/step-definitions/**/*.ts"],

    // TypeScript support via ts-node dengan tsconfig khusus BDD
    requireModule: ["ts-node/register"],

    // Format output — gunakan built-in formatters (kompatibel v13)
    format: [
      "progress-bar",
      "html:tests/bdd/reports/cucumber-report.html",
      "json:tests/bdd/reports/cucumber-report.json",
    ],

    // Feature files
    paths: ["tests/bdd/features/**/*.feature"],

    // Suppress "publish" warning
    publishQuiet: true,
  },
};

module.exports = config;
