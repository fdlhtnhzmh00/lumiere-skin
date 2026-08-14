/**
 * Validasi pesanan dan transisi status pesanan
 * Digunakan untuk State Transition Testing
 *
 * Business Rules Status:
 * DRAFT     -> CONFIRMED  (valid)
 * DRAFT     -> CANCELLED  (valid)
 * CONFIRMED -> COMPLETED  (valid)
 * CONFIRMED -> CANCELLED  (valid)
 * COMPLETED -> *          (TIDAK VALID - tidak bisa diubah)
 * CANCELLED -> *          (TIDAK VALID - tidak bisa diaktifkan kembali)
 */

export type OrderStatus = "DRAFT" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

// Array nilai valid untuk runtime validation
export const VALID_ORDER_STATUSES: OrderStatus[] = [
  "DRAFT",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

// Type guard: cek apakah string adalah OrderStatus yang valid
export function isValidOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    VALID_ORDER_STATUSES.includes(value as OrderStatus)
  );
}

export interface StatusTransitionResult {
  valid: boolean;
  error: string | null;
}

export interface CheckoutValidationInput {
  isLoggedIn: boolean;
  cartItemCount: number;
  recipientName?: string;
  shippingAddress?: string;
  phoneNumber?: string;
}

export interface CheckoutValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validasi transisi status pesanan
 *
 * Fungsi ini digunakan untuk State Transition Testing
 * dan Cyclomatic Complexity analysis
 *
 * V(G) = 8 branches + 1 = 9
 */
export function validateStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): StatusTransitionResult {
  // Branch 1: status tidak berubah
  if (currentStatus === newStatus) {
    return {
      valid: false,
      error: `Status pesanan sudah ${currentStatus}`,
    };
  }

  // Branch 2: dari COMPLETED tidak bisa berubah ke status apapun
  if (currentStatus === "COMPLETED") {
    return {
      valid: false,
      error: "Pesanan yang sudah selesai tidak dapat diubah statusnya",
    };
  }

  // Branch 3: dari CANCELLED tidak bisa diaktifkan kembali
  if (currentStatus === "CANCELLED") {
    return {
      valid: false,
      error: "Pesanan yang sudah dibatalkan tidak dapat diaktifkan kembali",
    };
  }

  // Branch 4: dari DRAFT hanya bisa ke CONFIRMED atau CANCELLED
  if (currentStatus === "DRAFT") {
    if (newStatus === "CONFIRMED" || newStatus === "CANCELLED") {
      return { valid: true, error: null };
    }
    return {
      valid: false,
      error: `Pesanan dengan status DRAFT tidak dapat langsung diubah ke ${newStatus}`,
    };
  }

  // Branch 5: dari CONFIRMED hanya bisa ke COMPLETED atau CANCELLED
  if (currentStatus === "CONFIRMED") {
    if (newStatus === "COMPLETED" || newStatus === "CANCELLED") {
      return { valid: true, error: null };
    }
    return {
      valid: false,
      error: `Pesanan dengan status CONFIRMED tidak dapat diubah ke ${newStatus}`,
    };
  }

  return {
    valid: false,
    error: "Transisi status tidak valid",
  };
}

/**
 * Validasi data checkout
 */
export function validateCheckout(
  input: CheckoutValidationInput
): CheckoutValidationResult {
  const errors: string[] = [];

  if (!input.isLoggedIn) {
    errors.push("Anda harus login untuk melakukan checkout");
  }

  if (input.cartItemCount === 0) {
    errors.push("Keranjang belanja tidak boleh kosong");
  }

  if (!input.recipientName || input.recipientName.trim().length === 0) {
    errors.push("Nama penerima wajib diisi");
  }

  if (!input.shippingAddress || input.shippingAddress.trim().length === 0) {
    errors.push("Alamat pengiriman wajib diisi");
  }

  if (!input.phoneNumber || input.phoneNumber.trim().length === 0) {
    errors.push("Nomor telepon wajib diisi");
  } else if (!/^[0-9+\-\s()]{8,15}$/.test(input.phoneNumber.trim())) {
    errors.push("Format nomor telepon tidak valid");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
