/**
 * lib/api-response.ts
 * Helper untuk membuat response API yang konsisten di seluruh endpoint.
 *
 * Format sukses:  { success: true,  data: {...}, message: "..." }
 * Format error:   { success: false, error: "KODE", message: "..." }
 */

import { NextResponse } from "next/server";

// =====================
// TIPE RESPONSE
// =====================
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
}

// Kode error standar yang digunakan di seluruh API
export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// =====================
// RESPONSE BUILDERS
// =====================

/**
 * Response sukses: 200 OK
 */
export function ok<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    { success: true, data, message } satisfies ApiSuccessResponse<T>,
    { status: 200 }
  );
}

/**
 * Response sukses: 201 Created
 */
export function created<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    { success: true, data, message } satisfies ApiSuccessResponse<T>,
    { status: 201 }
  );
}

/**
 * Response error: 400 Bad Request (validasi gagal)
 */
export function badRequest(message: string, error?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: error ?? ErrorCode.VALIDATION_ERROR,
      message,
    } satisfies ApiErrorResponse,
    { status: 400 }
  );
}

/**
 * Response error: 401 Unauthorized (tidak terautentikasi)
 */
export function unauthorized(message = "Autentikasi diperlukan"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: ErrorCode.UNAUTHORIZED,
      message,
    } satisfies ApiErrorResponse,
    { status: 401 }
  );
}

/**
 * Response error: 404 Not Found
 */
export function notFound(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: ErrorCode.NOT_FOUND,
      message,
    } satisfies ApiErrorResponse,
    { status: 404 }
  );
}

/**
 * Response error: 409 Conflict (data sudah ada)
 */
export function conflict(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: ErrorCode.CONFLICT,
      message,
    } satisfies ApiErrorResponse,
    { status: 409 }
  );
}

/**
 * Response error: 422 Unprocessable Entity (aturan bisnis dilanggar)
 * Digunakan untuk: stok tidak cukup, transisi status tidak valid, dll.
 */
export function unprocessable(message: string, error?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: error ?? ErrorCode.BUSINESS_RULE_VIOLATION,
      message,
    } satisfies ApiErrorResponse,
    { status: 422 }
  );
}

/**
 * Response error: 500 Internal Server Error
 */
export function internalError(message = "Terjadi kesalahan pada server"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: ErrorCode.INTERNAL_ERROR,
      message,
    } satisfies ApiErrorResponse,
    { status: 500 }
  );
}
