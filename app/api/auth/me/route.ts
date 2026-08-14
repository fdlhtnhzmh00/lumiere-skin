/**
 * app/api/auth/me/route.ts
 * GET /api/auth/me
 *
 * Verifikasi token JWT dan kembalikan data user yang sedang login.
 * Digunakan oleh AuthContext saat aplikasi pertama kali dimuat
 * untuk memastikan token yang tersimpan di localStorage masih valid.
 *
 * Jika token valid  → 200 + data user
 * Jika token invalid → 401
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth-middleware";
import { ok, notFound, internalError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    // 1. Verifikasi token dari Authorization header
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    // 2. Ambil data user terkini dari database
    //    (memastikan user masih ada dan tidak dihapus)
    const user = await prisma.user.findUnique({
      where: { id: auth.payload.userId },
      select: {
        id:       true,
        email:    true,
        username: true,
        name:     true,
      },
    });

    if (!user) {
      return notFound("Akun pengguna tidak ditemukan");
    }

    return ok({ user });
  } catch (error) {
    console.error("[GET /api/auth/me] Error:", error);
    return internalError();
  }
}
