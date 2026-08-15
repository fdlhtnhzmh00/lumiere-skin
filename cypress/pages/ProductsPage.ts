/**
 * cypress/pages/ProductsPage.ts
 *
 * Page Object Model untuk halaman Products LUMIÈRE SKIN.
 * Mencakup halaman listing (/products) dan detail produk (/products/:slug).
 */

export class ProductsPage {
  // ─── URLs ─────────────────────────────────────────────────────
  private readonly listUrl = "/products";

  // ─── Selectors ────────────────────────────────────────────────
  private readonly selectors = {
    // Product listing
    productCard:      '[data-testid="product-card"]',
    productCardName:  '[data-testid="product-card-name"]',
    productCardPrice: '[data-testid="product-card-price"]',
    addToCartCard:    '[data-testid="btn-add-to-cart-card"]',

    // Product detail
    productDetail:    '[data-testid="product-detail"]',
    productName:      '[data-testid="product-name"]',
    productPrice:     '[data-testid="product-price"]',
    stockBadge:       '[data-testid="product-stock-badge"]',
    addToCartBtn:     '[data-testid="btn-add-to-cart"]',
    buyNowBtn:        '[data-testid="btn-buy-now"]',
    qtyDecrease:      '[data-testid="btn-qty-decrease"]',
    qtyIncrease:      '[data-testid="btn-qty-increase"]',
    qtyDisplay:       '[data-testid="qty-display"]',
    addToCartError:   '[data-testid="add-to-cart-error"]',

    // Search & filter
    searchInput:      'input[placeholder*="Search"]',
    categoryButton:   'button',
  };

  // ─── Navigation ───────────────────────────────────────────────

  /** Navigasi ke halaman daftar produk */
  visit(): this {
    cy.visit(this.listUrl);
    return this;
  }

  /** Navigasi ke halaman detail produk berdasarkan slug */
  visitProduct(slug: string): this {
    cy.visit(`/products/${slug}`);
    return this;
  }

  // ─── Listing Page Interactions ────────────────────────────────

  /** Klik produk pertama di daftar */
  clickFirstProduct(): this {
    cy.get(this.selectors.productCard).first().click();
    return this;
  }

  /** Klik tombol "Tambah ke Keranjang" pada card produk */
  addFirstProductToCartFromCard(): this {
    cy.get(this.selectors.addToCartCard).first().click({ force: true });
    return this;
  }

  /** Cari produk menggunakan search bar */
  searchProduct(keyword: string): this {
    cy.get(this.selectors.searchInput).clear().type(keyword);
    cy.get("body").type("{enter}");
    return this;
  }

  // ─── Detail Page Interactions ─────────────────────────────────

  /** Klik tombol "Tambah ke Keranjang" di halaman detail */
  addToCart(): this {
    cy.get(this.selectors.addToCartBtn).should("be.visible").should("not.be.disabled").click();
    return this;
  }

  /** Tambah quantity di halaman detail */
  increaseQuantity(): this {
    cy.get(this.selectors.qtyIncrease).click();
    return this;
  }

  /** Kurangi quantity di halaman detail */
  decreaseQuantity(): this {
    cy.get(this.selectors.qtyDecrease).click();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────

  /** Verifikasi daftar produk ditampilkan */
  shouldShowProductList(): this {
    cy.get(this.selectors.productCard, { timeout: 15000 }).should("have.length.greaterThan", 0);
    return this;
  }

  /** Verifikasi setiap product card memiliki nama dan harga */
  shouldShowProductDetails(): this {
    cy.get(this.selectors.productCard).first().within(() => {
      cy.get(this.selectors.productCardName).should("be.visible").should("not.be.empty");
      cy.get(this.selectors.productCardPrice).should("be.visible").should("contain.text", "Rp");
    });
    return this;
  }

  /** Verifikasi halaman detail produk ditampilkan */
  shouldShowProductDetail(): this {
    cy.get(this.selectors.productDetail, { timeout: 15000 }).should("be.visible");
    cy.get(this.selectors.productName).should("be.visible").should("not.be.empty");
    cy.get(this.selectors.productPrice).should("be.visible").should("contain.text", "Rp");
    return this;
  }

  /** Verifikasi produk berhasil ditambahkan ke keranjang */
  shouldShowAddedToCart(): this {
    cy.get(this.selectors.addToCartBtn).should("contain.text", "Added", { timeout: 5000 });
    return this;
  }

  /** Verifikasi jumlah produk di detail */
  shouldShowQuantity(expected: number): this {
    cy.get(this.selectors.qtyDisplay).should("have.text", String(expected));
    return this;
  }

  /** Verifikasi minimal N produk ditampilkan */
  shouldShowAtLeast(count: number): this {
    cy.get(this.selectors.productCard, { timeout: 15000 }).should("have.length.at.least", count);
    return this;
  }
}
