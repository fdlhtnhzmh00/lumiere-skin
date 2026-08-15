/**
 * cypress/pages/CartPage.ts
 *
 * Page Object Model untuk halaman Cart (/cart) LUMIÈRE SKIN.
 */

export class CartPage {
  // ─── URL ──────────────────────────────────────────────────────
  private readonly url = "/cart";

  // ─── Selectors ────────────────────────────────────────────────
  private readonly selectors = {
    cartPage:       '[data-testid="cart-page"]',
    cartEmpty:      '[data-testid="cart-empty"]',
    cartItem:       '[data-testid="cart-item"]',
    itemName:       '[data-testid="cart-item-name"]',
    itemPrice:      '[data-testid="cart-item-price"]',
    itemSubtotal:   '[data-testid="cart-item-subtotal"]',
    qtyInput:       '[data-testid="cart-qty-input"]',
    qtyDecrease:    '[data-testid="btn-qty-decrease"]',
    qtyIncrease:    '[data-testid="btn-qty-increase"]',
    qtyError:       '[data-testid="cart-qty-error"]',
    removeBtn:      '[data-testid="btn-remove-item"]',
    totalPrice:     '[data-testid="cart-total-price"]',
    checkoutBtn:    '[data-testid="btn-checkout"]',
    itemCount:      '[data-testid="cart-items-count"]',
    clearCartBtn:   '[data-testid="btn-clear-cart"]',
    startShopping:  '[data-testid="btn-start-shopping"]',
  };

  // ─── Navigation ───────────────────────────────────────────────

  /** Navigasi ke halaman keranjang */
  visit(): this {
    cy.visit(this.url);
    return this;
  }

  // ─── Interactions ─────────────────────────────────────────────

  /** Tambah quantity item pertama */
  increaseFirstItemQty(): this {
    cy.get(this.selectors.cartItem).first().within(() => {
      cy.get(this.selectors.qtyIncrease).click();
    });
    return this;
  }

  /** Kurangi quantity item pertama */
  decreaseFirstItemQty(): this {
    cy.get(this.selectors.cartItem).first().within(() => {
      cy.get(this.selectors.qtyDecrease).click();
    });
    return this;
  }

  /** Set quantity item pertama via input langsung */
  setFirstItemQty(value: number): this {
    cy.get(this.selectors.cartItem).first().within(() => {
      cy.get(this.selectors.qtyInput).clear().type(String(value)).blur();
    });
    return this;
  }

  /** Hapus item pertama dari keranjang */
  removeFirstItem(): this {
    cy.get(this.selectors.cartItem).first().within(() => {
      cy.get(this.selectors.removeBtn).click();
    });
    return this;
  }

  /** Hapus semua item dari keranjang */
  clearCart(): this {
    cy.get(this.selectors.clearCartBtn).click();
    return this;
  }

  /** Klik tombol Checkout */
  clickCheckout(): this {
    cy.get(this.selectors.checkoutBtn).click();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────

  /** Verifikasi keranjang berisi item */
  shouldHaveItems(): this {
    cy.get(this.selectors.cartPage).should("be.visible");
    cy.get(this.selectors.cartItem).should("have.length.greaterThan", 0);
    return this;
  }

  /** Verifikasi keranjang kosong */
  shouldBeEmpty(): this {
    cy.get(this.selectors.cartEmpty, { timeout: 10000 }).should("be.visible");
    return this;
  }

  /** Verifikasi jumlah item dalam keranjang */
  shouldHaveItemCount(expected: number): this {
    cy.get(this.selectors.cartItem).should("have.length", expected);
    return this;
  }

  /** Verifikasi total harga ditampilkan */
  shouldShowTotalPrice(): this {
    cy.get(this.selectors.totalPrice).should("be.visible").should("contain.text", "Rp");
    return this;
  }

  /** Verifikasi nama produk ditampilkan di item */
  shouldShowItemName(name: string): this {
    cy.get(this.selectors.itemName).should("contain.text", name);
    return this;
  }

  /** Verifikasi quantity error ditampilkan */
  shouldShowQtyError(): this {
    cy.get(this.selectors.qtyError).should("be.visible");
    return this;
  }

  /** Verifikasi quantity item pertama */
  firstItemQtyShouldBe(expected: number): this {
    cy.get(this.selectors.cartItem).first().within(() => {
      cy.get(this.selectors.qtyInput).should("have.value", String(expected));
    });
    return this;
  }
}
