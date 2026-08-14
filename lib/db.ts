import { PrismaClient } from "@prisma/client";

/**
 * lib/db.ts — Prisma Client Singleton
 *
 * Fix untuk Neon PostgreSQL connection pool timeout (P2024):
 * 1. Hanya log "error" di semua environment untuk mengurangi overhead
 * 2. Singleton yang ketat menggunakan globalThis
 * 3. `log: ["query"]` dihapus karena membuat banyak log dan overhead
 *
 * Jika masih terjadi P2024, tambahkan ke DATABASE_URL:
 * &connection_limit=5&pool_timeout=30
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Hanya log error — mengurangi overhead dan connection churn
    log: ["error"],
  });

// Simpan instance di globalThis saat development
// Mencegah multiple PrismaClient instances saat hot reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
