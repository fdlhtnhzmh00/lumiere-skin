/**
 * cypress/pages/CheckoutPage.ts
 *
 * Page Object Model untuk halaman Checkout (/checkout) LUMIÈRE SKIN.
 */

export class CheckoutPage {
  // ─── URL ──────────────────────────────────────────────────────
  private readonly url = "/checkout";

  // ─── Selectors ────────────────────────────────────────────────
  private readonly selectors = {
    checkoutPage:   '[data-testid="checkout-page"]',
    checkoutForm:   '[data-testid="checkout-form"]',
    errorMessage:   '[data-testid="checkout-error"]',
    recipientName:  '[data-testid="input-recipient-name"]',
    shippingAddr:   '[data-testid="input-shipping-address"]',
    phoneNumber:    '[data-testid="input-phone"]',
    notes:          '[data-testid="input-notes"]',
    submitBtn:      '[data-testid="btn-submit-order"]',
    totalPrice:     '[data-testid="checkout-total"]',
    orderSummary:   '[data-testid="order-summary"]',
  };

  // ─── Navigation ───────────────────────────────────────────────

  /** Navigasi ke halaman checkout */
  visit(): this {
    cy.visit(this.url);
    return this;
  }

  // ─── Form Interactions ────────────────────────────────────────

  /** Isi nama penerima */
  fillRecipientName(value: string): this {
    cy.get(this.selectors.recipientName).clear();
    if (value) cy.get(this.selectors.recipientName).type(value);
    return this;
  }

  /** Isi alamat pengiriman */
  fillShippingAddress(value: string): this {
    cy.get(this.selectors.shippingAddr).clear();
    if (value) cy.get(this.selectors.shippingAddr).type(value);
    return this;
  }

  /** Isi nomor telepon */
  fillPhoneNumber(value: string): this {
    cy.get(this.selectors.phoneNumber).clear();
    if (value) cy.get(this.selectors.phoneNumber).type(value);
    return this;
  }

  /** Isi catatan (opsional) */
  fillNotes(value: string): this {
    cy.get(this.selectors.notes).clear();
    if (value) cy.get(this.selectors.notes).type(value);
    return this;
  }

  /** Isi seluruh form checkout sekaligus */
  fillForm(data: {
    recipientName:   string;
    shippingAddress: string;
    phoneNumber:     string;
    notes?:          string;
  }): this {
    this.fillRecipientName(data.recipientName);
    this.fillShippingAddress(data.shippingAddress);
    this.fillPhoneNumber(data.phoneNumber);
    if (data.notes) this.fillNotes(data.notes);
    return this;
  }

  /** Klik tombol Buat Pesanan */
  submit(): this {
    cy.get(this.selectors.submitBtn).click();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────

  /** Verifikasi halaman checkout tampil */
  shouldBeVisible(): this {
    cy.get(this.selectors.checkoutPage, { timeout: 10000 }).should("be.visible");
    cy.get(this.selectors.checkoutForm).should("be.visible");
    return this;
  }

  /** Verifikasi order summary ditampilkan */
  shouldShowOrderSummary(): this {
    cy.get(this.selectors.orderSummary).should("be.visible");
    cy.get(this.selectors.totalPrice).should("be.visible").should("contain.text", "Rp");
    return this;
  }

  /** Verifikasi pesan error API ditampilkan */
  shouldShowError(): this {
    cy.get(this.selectors.errorMessage).should("be.visible");
    return this;
  }

  /** Verifikasi error mengandung teks tertentu */
  shouldShowErrorContaining(text: string): this {
    cy.get(this.selectors.errorMessage).should("be.visible").should("contain.text", text);
    return this;
  }

  /** Verifikasi checkout berhasil — redirect ke halaman order */
  shouldRedirectToOrder(): this {
    cy.url().should("include", "/orders/", { timeout: 15000 });
    return this;
  }

  /** Verifikasi ada error validasi inline (field kosong) */
  shouldShowInlineValidation(): this {
    // Validasi inline menampilkan teks "wajib diisi" atau sejenisnya
    cy.get("body").should("contain.text", "wajib");
    return this;
  }

  /** Verifikasi redirect ke login jika belum authenticated */
  shouldRedirectToLogin(): this {
    cy.url().should("include", "/login", { timeout: 10000 });
    return this;
  }
}
