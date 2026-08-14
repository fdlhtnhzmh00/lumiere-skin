/**
 * lib/state-machines/auth-state.ts
 *
 * Model state machine untuk autentikasi pengguna.
 * Digunakan untuk State Transition Testing (Phase 13).
 *
 * ─── State Diagram ────────────────────────────────────────────
 *
 *   ┌──────────────────────┐          ┌───────────────────────┐
 *   │  UNAUTHENTICATED     │          │   AUTHENTICATED       │
 *   │  (S1)                │          │   (S2)                │
 *   └──────────────────────┘          └───────────────────────┘
 *         │                                     │
 *    E1: login_success → S2 ──────────────────→ │
 *    E2: login_failure → S1 (stays)              │
 *    E3: empty_fields  → S1 (stays)              │
 *                                           E4: logout → S1
 *                                           E5: token_expired → S1
 *
 * ─── Valid Transitions ────────────────────────────────────────
 * S1 + E1 → S2   Login berhasil (TR-01)
 * S1 + E2 → S1   Login gagal — credentials salah (TR-02)
 * S1 + E3 → S1   Login gagal — field kosong (TR-03)
 * S2 + E4 → S1   Logout berhasil (TR-04)
 * S2 + E5 → S1   Token expired — auto logout (TR-05)
 *
 * ─── Invalid / Blocked Transitions ───────────────────────────
 * S1 + E4 → N/A  Tidak bisa logout jika belum login
 * S2 + E1 → N/A  Tidak bisa login ulang jika sudah authenticated
 */

// ─── Types ────────────────────────────────────────────────────

export type AuthState = "UNAUTHENTICATED" | "AUTHENTICATED";

export const AUTH_STATES = ["UNAUTHENTICATED", "AUTHENTICATED"] as const;

export type AuthEvent =
  | "LOGIN_SUCCESS"           // E1: Credentials valid, token issued
  | "LOGIN_FAILURE_INVALID"   // E2: Credentials salah (wrong password/username)
  | "LOGIN_FAILURE_EMPTY"     // E3: Field kosong (validation error)
  | "LOGOUT"                  // E4: User sengaja logout
  | "TOKEN_EXPIRED";          // E5: JWT token kedaluwarsa

export interface AuthTransitionResult {
  success:    boolean;
  nextState:  AuthState;
  error?:     string;
  eventType?: string;
}

// ─── Credentials Validation ──────────────────────────────────
export interface LoginCredentials {
  identifier: string;  // email atau username
  password:   string;
}

export function validateLoginCredentials(credentials: LoginCredentials): {
  valid: boolean;
  error?: string;
} {
  if (!credentials.identifier || credentials.identifier.trim() === "") {
    return { valid: false, error: "Email atau username wajib diisi" };
  }
  if (!credentials.password || credentials.password === "") {
    return { valid: false, error: "Password wajib diisi" };
  }
  return { valid: true };
}

// ─── State Transition Function ────────────────────────────────

/**
 * Simulasi transisi state autentikasi.
 * Digunakan untuk State Transition Testing — tidak terhubung ke API nyata.
 */
export function transitionAuthState(
  currentState: AuthState,
  event: AuthEvent
): AuthTransitionResult {
  switch (event) {
    // E1: Login berhasil
    case "LOGIN_SUCCESS": {
      if (currentState === "UNAUTHENTICATED") {
        return {
          success:   true,
          nextState: "AUTHENTICATED",
          eventType: "LOGIN_SUCCESS",
        };
      }
      // Sudah authenticated — tidak perlu login lagi
      return {
        success:   false,
        nextState: currentState,
        error:     "Pengguna sudah dalam kondisi terautentikasi",
        eventType: "LOGIN_SUCCESS",
      };
    }

    // E2: Login gagal — credentials salah
    case "LOGIN_FAILURE_INVALID": {
      if (currentState === "UNAUTHENTICATED") {
        return {
          success:   false,
          nextState: "UNAUTHENTICATED",
          error:     "Email/username atau password salah",
          eventType: "LOGIN_FAILURE_INVALID",
        };
      }
      return {
        success:   false,
        nextState: currentState,
        error:     "Operasi tidak valid pada state saat ini",
        eventType: "LOGIN_FAILURE_INVALID",
      };
    }

    // E3: Login gagal — field kosong
    case "LOGIN_FAILURE_EMPTY": {
      if (currentState === "UNAUTHENTICATED") {
        return {
          success:   false,
          nextState: "UNAUTHENTICATED",
          error:     "Email/username dan password wajib diisi",
          eventType: "LOGIN_FAILURE_EMPTY",
        };
      }
      return {
        success:   false,
        nextState: currentState,
        error:     "Operasi tidak valid pada state saat ini",
        eventType: "LOGIN_FAILURE_EMPTY",
      };
    }

    // E4: Logout
    case "LOGOUT": {
      if (currentState === "AUTHENTICATED") {
        return {
          success:   true,
          nextState: "UNAUTHENTICATED",
          eventType: "LOGOUT",
        };
      }
      // Tidak bisa logout jika belum authenticated
      return {
        success:   false,
        nextState: currentState,
        error:     "Tidak dapat logout — pengguna belum login",
        eventType: "LOGOUT",
      };
    }

    // E5: Token expired
    case "TOKEN_EXPIRED": {
      if (currentState === "AUTHENTICATED") {
        return {
          success:   true,
          nextState: "UNAUTHENTICATED",
          eventType: "TOKEN_EXPIRED",
        };
      }
      // Token tidak bisa expired jika tidak ada token
      return {
        success:   false,
        nextState: currentState,
        error:     "Tidak ada token aktif untuk kedaluwarsa",
        eventType: "TOKEN_EXPIRED",
      };
    }
  }
}

// ─── State Transition Table (untuk dokumentasi) ───────────────

/**
 * Menghasilkan seluruh kombinasi transisi state × event
 * yang digunakan dalam State Transition Table di laporan PPT.
 */
export function generateTransitionTable(): Array<{
  currentState: AuthState;
  event:        AuthEvent;
  valid:        boolean;
  nextState:    AuthState | "N/A";
  description:  string;
}> {
  const states:  AuthState[]  = ["UNAUTHENTICATED", "AUTHENTICATED"];
  const events:  AuthEvent[]  = [
    "LOGIN_SUCCESS",
    "LOGIN_FAILURE_INVALID",
    "LOGIN_FAILURE_EMPTY",
    "LOGOUT",
    "TOKEN_EXPIRED",
  ];

  return states.flatMap((state) =>
    events.map((event) => {
      const result = transitionAuthState(state, event);
      return {
        currentState: state,
        event,
        valid:        result.success,
        nextState:    result.success ? result.nextState : "N/A",
        description:  result.error ?? `${state} + ${event} → ${result.nextState}`,
      };
    })
  );
}
