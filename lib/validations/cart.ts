/**
 * Validasi keranjang belanja
 * Digunakan untuk Cyclomatic Complexity analysis dan TDD
 *
 * Business Rules:
 * - Jumlah minimal pembelian: 1 unit
 * - Jumlah maksimal pembelian: 10 unit per produk
 * - Jumlah tidak boleh melebihi stok yang tersedia
 * - Jumlah tidak boleh berupa negatif, nol, pecahan, atau teks
 */

export interface QuantityValidationResult {
  valid: boolean;
  error: string | null;
}

export const CART_MIN_QUANTITY = 1;
export const CART_MAX_QUANTITY = 10;

/**
 * Validasi jumlah produk dalam keranjang
 *
 * Cyclomatic Complexity: V(G) = jumlah percabangan + 1
 * Branches: typeof check, isNaN, isInteger, <= 0, > MAX, > stock
 * V(G) = 6 + 1 = 7
 */
export function validateCartQuantity(
  quantity: unknown,
  availableStock: number
): QuantityValidationResult {
  // Branch 1: cek tipe data
  if (typeof quantity !== "number" && typeof quantity !== "string") {
    return { valid: false, error: "Jumlah harus berupa angka" };
  }

  const numQty = Number(quantity);

  // Branch 2: cek NaN (termasuk teks non-numerik)
  if (isNaN(numQty)) {
    return { valid: false, error: "Jumlah harus berupa angka yang valid" };
  }

  // Branch 3: cek bilangan bulat (tidak boleh pecahan)
  if (!Number.isInteger(numQty)) {
    return { valid: false, error: "Jumlah tidak boleh berupa pecahan" };
  }

  // Branch 4: cek minimum
  if (numQty <= 0) {
    return {
      valid: false,
      error: `Jumlah minimal pembelian adalah ${CART_MIN_QUANTITY} unit`,
    };
  }

  // Branch 5: cek maksimum per produk
  if (numQty > CART_MAX_QUANTITY) {
    return {
      valid: false,
      error: `Jumlah maksimal pembelian adalah ${CART_MAX_QUANTITY} unit per produk`,
    };
  }

  // Branch 6: cek stok tersedia
  if (numQty > availableStock) {
    return {
      valid: false,
      error: `Jumlah melebihi stok yang tersedia (stok: ${availableStock})`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Kalkulasi total harga keranjang
 */
export function calculateCartTotal(
  items: Array<{ price: number; quantity: number }>
): number {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

/**
 * Validasi bahwa keranjang tidak kosong
 */
export function validateCartNotEmpty(itemCount: number): QuantityValidationResult {
  if (itemCount === 0) {
    return { valid: false, error: "Keranjang belanja tidak boleh kosong" };
  }
  return { valid: true, error: null };
}
