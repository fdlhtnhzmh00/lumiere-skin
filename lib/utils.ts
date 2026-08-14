import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility untuk menggabungkan class Tailwind dengan aman
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format harga ke format Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Truncate teks panjang
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Generate order number unik
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LS-${timestamp}-${random}`;
}

// Cek apakah string adalah angka valid
export function isPositiveInteger(value: unknown): boolean {
  if (typeof value === "string") {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  }
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0;
  }
  return false;
}

// Generate slug URL-friendly dari nama produk
// Contoh: "Vitamin C Brightening Serum" -> "vitamin-c-brightening-serum"
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // hilangkan diakritik
    .replace(/[^a-z0-9\s-]/g, "")      // hapus karakter non-alfanumerik
    .replace(/\s+/g, "-")              // ganti spasi dengan strip
    .replace(/-+/g, "-")               // hilangkan strip berulang
    .trim()
    .replace(/^-|-$/g, "");            // hapus strip di awal/akhir
}
