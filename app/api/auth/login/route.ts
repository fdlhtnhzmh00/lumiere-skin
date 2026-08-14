/**
 * app/api/auth/login/route.ts
 * POST /api/auth/login
 *
 * Login pengguna dan kembalikan JWT token.
 * Implementasi lengkap: Phase 9 (Authentication)
 */

import { NextRequest } from "next/server";
import { badRequest } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  // TODO: Phase 9 - implementasi login
  void request;
  return badRequest("Endpoint belum diimplementasikan");
}
