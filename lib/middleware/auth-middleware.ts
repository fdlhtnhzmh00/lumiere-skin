/**
 * lib/middleware/auth-middleware.ts
 * Middleware autentikasi untuk Next.js API Routes.
 *
 * Cara penggunaan di route handler:
 *
 *   const auth = await requireAuth(request);
 *   if (!auth.success) return auth.response;
 *   const { userId, email, name } = auth.payload;
 */

import { type NextRequest } from "next/server";
import { verifyToken, extractTokenFromHeader, type JwtPayload } from "@/lib/auth";
import { unauthorized } from "@/lib/api-response";

// =====================
// TIPE RETURN
// =====================
type AuthSuccess = {
  success: true;
  payload: JwtPayload;
};

type AuthFailure = {
  success: false;
  response: ReturnType<typeof unauthorized>;
};

export type AuthResult = AuthSuccess | AuthFailure;

// =====================
// FUNGSI UTAMA
// =====================

/**
 * Verifikasi JWT token dari Authorization header.
 * Mengembalikan AuthResult yang berisi payload atau error response.
 *
 * Contoh penggunaan:
 *   const auth = await requireAuth(request);
 *   if (!auth.success) return auth.response;
 *   // auth.payload.userId sekarang tersedia
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      success: false,
      response: unauthorized("Token autentikasi diperlukan. Silakan login terlebih dahulu."),
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return {
      success: false,
      response: unauthorized("Token tidak valid atau telah kedaluwarsa. Silakan login ulang."),
    };
  }

  return {
    success: true,
    payload,
  };
}

/**
 * Ekstrak payload dari token tanpa memaksa autentikasi.
 * Berguna untuk endpoint yang bersifat opsional auth (bisa guest atau user).
 * Mengembalikan null jika tidak ada token atau token tidak valid.
 */
export function getOptionalAuth(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader);
  if (!token) return null;
  return verifyToken(token);
}
