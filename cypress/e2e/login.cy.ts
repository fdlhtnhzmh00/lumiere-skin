/**
 * cypress/e2e/login.cy.ts
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  UI AUTOMATION — Login Page Tests                           ║
 * ║  Phase 17 | LUMIÈRE SKIN                                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Test Cases:
 *   TC-UI-01: Login dengan data valid (email)            [POSITIF]
 *   TC-UI-02: Login dengan data valid (username)         [POSITIF]
 *   TC-UI-03: Login dengan password yang salah           [NEGATIF]
 *   TC-UI-04: Login dengan email tidak terdaftar         [NEGATIF]
 *   TC-UI-05: Login dengan field email kosong            [NEGATIF]
 *   TC-UI-06: Login dengan field password kosong         [NEGATIF]
 */

import { LoginPage } from "../pages/LoginPage";

const loginPage = new LoginPage();

describe("TC-UI Login — Autentikasi Pengguna LUMIÈRE SKIN", () => {

  beforeEach(() => {
    // Bersihkan state sebelum setiap test
    cy.clearAppState();
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-01: Login valid dengan email
  // ────────────────────────────────────────────────────────────
  it("TC-UI-01: Login berhasil menggunakan email yang terdaftar", () => {
    cy.fixture("testData").then((data) => {
      loginPage.visit();
      loginPage.submitButtonShouldBeEnabled();
      loginPage.loginWith(data.validUser.identifier, data.validUser.password);
      loginPage.shouldBeLoggedIn();

      // Verifikasi nama user muncul di navbar
      cy.get("body").should("contain.text", data.validUser.name);
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-02: Login valid dengan username
  // ────────────────────────────────────────────────────────────
  it("TC-UI-02: Login berhasil menggunakan username", () => {
    cy.fixture("testData").then((data) => {
      loginPage.visit();
      loginPage.loginWith("team1", data.validUser.password);
      loginPage.shouldBeLoggedIn();
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-03: Login gagal — password salah
  // ────────────────────────────────────────────────────────────
  it("TC-UI-03: Login gagal karena password tidak sesuai", () => {
    cy.fixture("testData").then((data) => {
      loginPage.visit();
      loginPage.loginWith(data.wrongPasswordUser.identifier, data.wrongPasswordUser.password);

      // Harus tetap di halaman login
      cy.url().should("include", "/login");
      loginPage.shouldShowAuthError();
      loginPage.shouldShowErrorContaining("salah");
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-04: Login gagal — email tidak terdaftar
  // ────────────────────────────────────────────────────────────
  it("TC-UI-04: Login gagal karena email tidak terdaftar", () => {
    cy.fixture("testData").then((data) => {
      loginPage.visit();
      loginPage.loginWith(data.invalidUser.identifier, data.invalidUser.password);

      cy.url().should("include", "/login");
      loginPage.shouldShowAuthError();
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-05: Login gagal — email/identifier kosong
  // ────────────────────────────────────────────────────────────
  it("TC-UI-05: Login gagal karena field email kosong", () => {
    cy.fixture("testData").then((data) => {
      loginPage.visit();
      // Hanya isi password, biarkan identifier kosong
      loginPage.fillPassword(data.validUser.password);
      loginPage.submit();

      // Tetap di halaman login, form validation error
      cy.url().should("include", "/login");
      loginPage.shouldShowValidationError();
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-06: Login gagal — password kosong
  // ────────────────────────────────────────────────────────────
  it("TC-UI-06: Login gagal karena field password kosong", () => {
    cy.fixture("testData").then((data) => {
      loginPage.visit();
      // Hanya isi identifier, biarkan password kosong
      loginPage.fillIdentifier(data.validUser.identifier);
      loginPage.submit();

      cy.url().should("include", "/login");
      loginPage.shouldShowValidationError();
    });
  });
});
