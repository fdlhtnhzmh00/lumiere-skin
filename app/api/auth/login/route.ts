/**
 * app/api/auth/login/route.ts
 * POST /api/auth/login
 *
 * Login pengguna menggunakan email atau username + password.
 * Mengembalikan JWT token yang digunakan sebagai Bearer token
 * di semua endpoint yang memerlukan autentikasi.
 *
 * Business Rules:
 * - identifier (email/username) wajib diisi
 * - password wajib diisi
 * - Kredensial salah harus menghasilkan 401
 * - Field kosong harus menghasilkan 400
 */

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import {
  ok,
  badRequest,
  unauthorized,
  internalError,
  ErrorCode,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse request body ────────────────────────────────
    let body: { identifier?: unknown; password?: unknown };
    try {
      body = await request.json();
    } catch {
      return badRequest("Request body harus berupa JSON yang valid");
    }

    const { identifier, password } = body;

    // ── 2. Validasi field kosong (FR-01, Business Rule) ──────
    if (!identifier || String(identifier).trim() === "") {
      return badRequest(
        "Email atau username wajib diisi",
        ErrorCode.VALIDATION_ERROR
      );
    }
    if (!password || String(password).trim() === "") {
      return badRequest("Password wajib diisi", ErrorCode.VALIDATION_ERROR);
    }

    const identifierStr = String(identifier).trim();
    const passwordStr = String(password);

    // ── 3. Cari user berdasarkan email atau username ─────────
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifierStr },
          { username: identifierStr },
        ],
      },
    });

    if (!user) {
      return unauthorized("Email/username atau password salah");
    }

    // ── 4. Verifikasi password dengan bcrypt ─────────────────
    const isPasswordValid = await bcrypt.compare(passwordStr, user.password);
    if (!isPasswordValid) {
      return unauthorized("Email/username atau password salah");
    }

    // ── 5. Generate JWT token ────────────────────────────────
    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    });

    // ── 6. Kembalikan token dan data user (tanpa password) ───
    return ok(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
      },
      "Login berhasil"
    );
  } catch (error) {
    console.error("[POST /api/auth/login] Error:", error);
    return internalError();
  }
}
