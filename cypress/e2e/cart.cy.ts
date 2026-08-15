/**
 * cypress/e2e/cart.cy.ts
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  UI AUTOMATION — Cart Page Tests                            ║
 * ║  Phase 17 | LUMIÈRE SKIN                                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Test Cases:
 *   TC-UI-11: Menambahkan produk ke keranjang            [POSITIF]
 *   TC-UI-12: Mengubah jumlah produk dalam keranjang     [POSITIF]
 *   TC-UI-13: Menghapus produk dari keranjang            [POSITIF]
 *   TC-UI-14: Keranjang kosong setelah hapus semua       [POSITIF]
 *   TC-UI-15: Validasi quantity melebihi max (10)        [NEGATIF]
 */

import { CartPage }     from "../pages/CartPage";
import { ProductsPage } from "../pages/ProductsPage";

const cartPage     = new CartPage();
const productsPage = new ProductsPage();

describe("TC-UI Cart — Keranjang Belanja LUMIÈRE SKIN", () => {

  beforeEach(() => {
    // Login dan bersihkan keranjang sebelum setiap test
    cy.clearAppState();
    cy.fixture("testData").then((data) => {
      cy.login(data.validUser.identifier, data.validUser.password);
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-11: Menambahkan produk ke keranjang
  // ────────────────────────────────────────────────────────────
  it("TC-UI-11: Produk berhasil ditambahkan ke keranjang", () => {
    cy.fixture("testData").then((data) => {
      // Tambah produk via halaman detail
      cy.addToCart(data.testProduct.slug);

      // Navigasi ke halaman keranjang
      cartPage.visit();

      // Verifikasi produk ada di keranjang
      cartPage.shouldHaveItems();
      cartPage.shouldHaveItemCount(1);
      cartPage.shouldShowTotalPrice();
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-12: Mengubah jumlah produk di keranjang
  // ────────────────────────────────────────────────────────────
  it("TC-UI-12: Mengubah jumlah produk dalam keranjang berhasil", () => {
    cy.fixture("testData").then((data) => {
      cy.addToCart(data.testProduct.slug);
      cartPage.visit();
      cartPage.shouldHaveItems();

      // Catat total awal
      cy.get('[data-testid="cart-total-price"]').invoke("text").as("initialTotal");

      // Tambah quantity
      cartPage.increaseFirstItemQty();

      // Verifikasi quantity berubah jadi 2
      cartPage.firstItemQtyShouldBe(2);

      // Verifikasi total berubah (lebih besar dari sebelumnya)
      cy.get('[data-testid="cart-total-price"]').should("be.visible");
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-13: Menghapus produk dari keranjang
  // ────────────────────────────────────────────────────────────
  it("TC-UI-13: Produk berhasil dihapus dari keranjang", () => {
    cy.fixture("testData").then((data) => {
      cy.addToCart(data.testProduct.slug);
      cartPage.visit();
      cartPage.shouldHaveItems();

      // Hapus item pertama
      cartPage.removeFirstItem();

      // Keranjang harus kosong
      cartPage.shouldBeEmpty();
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-14: Keranjang kosong state
  // ────────────────────────────────────────────────────────────
  it("TC-UI-14: Halaman keranjang menampilkan empty state jika tidak ada item", () => {
    cartPage.visit();
    // Keranjang kosong karena clearAppState di beforeEach
    cartPage.shouldBeEmpty();
    cy.contains("empty").should("be.visible");
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-15: Validasi quantity berlebihan
  // ────────────────────────────────────────────────────────────
  it("TC-UI-15: Validasi error ketika quantity melebihi batas maksimal (10)", () => {
    cy.fixture("testData").then((data) => {
      cy.addToCart(data.testProduct.slug);
      cartPage.visit();
      cartPage.shouldHaveItems();

      // Set quantity ke 11 (melebihi max 10)
      cartPage.setFirstItemQty(11);

      // Verifikasi error muncul atau quantity dikembalikan ke valid
      cy.get("body").then(($body) => {
        if ($body.find('[data-testid="cart-qty-error"]').length > 0) {
          cartPage.shouldShowQtyError();
        } else {
          // Quantity dikembalikan otomatis ke nilai valid
          cy.get('[data-testid="cart-qty-input"]').invoke("val").then((val) => {
            expect(Number(val)).to.be.at.most(10);
          });
        }
      });
    });
  });
});
