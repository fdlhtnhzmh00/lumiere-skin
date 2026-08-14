/**
 * Validasi data produk
 * Digunakan untuk TDD dan Cyclomatic Complexity analysis
 */

export interface ProductInput {
  name?: unknown;
  price?: unknown;
  stock?: unknown;
  description?: unknown;
  categoryId?: unknown;
  imageUrl?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validasi nama produk
 */
export function validateProductName(name: unknown): string | null {
  if (name === undefined || name === null || name === "") {
    return "Nama produk wajib diisi";
  }
  if (typeof name !== "string") {
    return "Nama produk harus berupa teks";
  }
  if (name.trim().length === 0) {
    return "Nama produk tidak boleh hanya berisi spasi";
  }
  if (name.trim().length < 3) {
    return "Nama produk minimal 3 karakter";
  }
  if (name.trim().length > 200) {
    return "Nama produk maksimal 200 karakter";
  }
  return null;
}

/**
 * Validasi harga produk
 */
export function validateProductPrice(price: unknown): string | null {
  if (price === undefined || price === null || price === "") {
    return "Harga produk wajib diisi";
  }
  const numPrice = Number(price);
  if (isNaN(numPrice)) {
    return "Harga produk harus berupa angka";
  }
  if (numPrice <= 0) {
    return "Harga produk harus lebih besar dari nol";
  }
  if (!isFinite(numPrice)) {
    return "Harga produk tidak valid";
  }
  return null;
}

/**
 * Validasi stok produk
 */
export function validateProductStock(stock: unknown): string | null {
  if (stock === undefined || stock === null || stock === "") {
    return "Stok produk wajib diisi";
  }
  const numStock = Number(stock);
  if (isNaN(numStock)) {
    return "Stok produk harus berupa angka";
  }
  if (!Number.isInteger(numStock)) {
    return "Stok produk harus berupa bilangan bulat";
  }
  if (numStock < 0) {
    return "Stok produk tidak boleh bernilai negatif";
  }
  return null;
}

/**
 * Validasi lengkap data produk
 * Fungsi ini memiliki Cyclomatic Complexity yang relevan untuk dianalisis
 */
export function validateProduct(input: ProductInput): ValidationResult {
  const errors: string[] = [];

  const nameError = validateProductName(input.name);
  if (nameError) errors.push(nameError);

  const priceError = validateProductPrice(input.price);
  if (priceError) errors.push(priceError);

  const stockError = validateProductStock(input.stock);
  if (stockError) errors.push(stockError);

  if (!input.description || String(input.description).trim().length === 0) {
    errors.push("Deskripsi produk wajib diisi");
  }

  if (!input.categoryId || String(input.categoryId).trim().length === 0) {
    errors.push("Kategori produk wajib dipilih");
  }

  if (!input.imageUrl || String(input.imageUrl).trim().length === 0) {
    errors.push("URL gambar produk wajib diisi");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
