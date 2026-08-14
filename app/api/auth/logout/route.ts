/**
 * app/api/auth/logout/route.ts
 * POST /api/auth/logout
 *
 * Logout endpoint. Karena JWT bersifat stateless, logout sebenarnya
 * dilakukan di sisi client (hapus token dari localStorage).
 * Endpoint ini disediakan untuk:
 * 1. Konsistensi arsitektur RESTful
 * 2. Audit log (kapan user logout)
 * 3. Future: implementasi token blacklist jika diperlukan
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth-middleware";
import { ok, internalError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    // Verifikasi bahwa request berasal dari user yang terautentikasi
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    // JWT stateless: tidak ada server-side session yang perlu dihapus.
    // Client bertanggung jawab untuk menghapus token dari localStorage.
    console.log(`[Logout] User ${auth.payload.email} (${auth.payload.userId}) logout`);

    return ok(null, "Logout berhasil");
  } catch (error) {
    console.error("[POST /api/auth/logout] Error:", error);
    return internalError();
  }
}
