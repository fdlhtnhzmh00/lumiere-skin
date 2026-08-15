/**
 * cypress/pages/LoginPage.ts
 *
 * Page Object Model untuk halaman Login LUMIÈRE SKIN.
 * Mengenkapsulasi semua interaksi UI pada halaman /login.
 */

export class LoginPage {
  // ─── URL ──────────────────────────────────────────────────────
  private readonly url = "/login";

  // ─── Selectors (data-testid) ──────────────────────────────────
  private readonly selectors = {
    identifierInput: '[data-testid="login-identifier"]',
    passwordInput:   '[data-testid="login-password"]',
    submitButton:    '[data-testid="login-submit"]',
    errorMessage:    '[data-testid="login-error"]',
    showPasswordBtn: '[aria-label="Tampilkan password"]',
  };

  // ─── Navigation ───────────────────────────────────────────────

  /** Navigasi ke halaman login */
  visit(): this {
    cy.visit(this.url);
    return this;
  }

  /** Verifikasi halaman login sudah tampil */
  shouldBeVisible(): this {
    cy.url().should("include", "/login");
    cy.get(this.selectors.identifierInput).should("be.visible");
    return this;
  }

  // ─── Form Interactions ────────────────────────────────────────

  /** Isi field email atau username */
  fillIdentifier(value: string): this {
    cy.get(this.selectors.identifierInput).clear();
    if (value) cy.get(this.selectors.identifierInput).type(value);
    return this;
  }

  /** Isi field password */
  fillPassword(value: string): this {
    cy.get(this.selectors.passwordInput).clear();
    if (value) cy.get(this.selectors.passwordInput).type(value);
    return this;
  }

  /** Klik tombol submit login */
  submit(): this {
    cy.get(this.selectors.submitButton).click();
    return this;
  }

  /** Login lengkap: isi identifier + password + submit */
  loginWith(identifier: string, password: string): this {
    this.fillIdentifier(identifier);
    this.fillPassword(password);
    this.submit();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────

  /** Verifikasi login berhasil — diarahkan ke halaman lain */
  shouldBeLoggedIn(): this {
    cy.url().should("not.include", "/login", { timeout: 15000 });
    return this;
  }

  /** Verifikasi pesan error autentikasi muncul */
  shouldShowAuthError(): this {
    cy.get(this.selectors.errorMessage).should("be.visible");
    return this;
  }

  /** Verifikasi pesan error mengandung teks tertentu */
  shouldShowErrorContaining(text: string): this {
    cy.get(this.selectors.errorMessage).should("be.visible").should("contain.text", text);
    return this;
  }

  /** Verifikasi form validation error (inline, bukan API error) */
  shouldShowValidationError(): this {
    // Validasi form menampilkan teks error di bawah field
    cy.get("body").should("contain.text", "wajib diisi");
    return this;
  }

  /** Verifikasi tombol submit ada dan aktif */
  submitButtonShouldBeEnabled(): this {
    cy.get(this.selectors.submitButton).should("be.visible").should("not.be.disabled");
    return this;
  }

  /** Verifikasi loading state saat submit */
  shouldShowLoading(): this {
    cy.get(this.selectors.submitButton).should("contain.text", "Signing In");
    return this;
  }
}
