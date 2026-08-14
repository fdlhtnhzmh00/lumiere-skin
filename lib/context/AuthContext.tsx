"use client";

/**
 * lib/context/AuthContext.tsx
 * Manajemen state autentikasi.
 *
 * Alur:
 * 1. Saat mount: baca token dari localStorage
 * 2. Verifikasi token ke GET /api/auth/me
 *    - Token valid   → simpan user state
 *    - Token invalid → hapus dari localStorage (auto-logout)
 *    - Network error → gunakan data cached (tolerate offline)
 * 3. Token juga disimpan di cookie untuk keperluan middleware
 *
 * Business Rules:
 * - Token JWT kedaluwarsa → auto-logout saat verifikasi
 * - User yang dihapus admin → auto-logout saat verifikasi
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// ─── Types ────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

// ─── Constants ────────────────────────────────────────────────
const LS_TOKEN   = "lumiere_token";
const LS_USER    = "lumiere_user";
const COOKIE_KEY = "lumiere_auth";

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Cookie helpers ───────────────────────────────────────────
function setCookie(value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${COOKIE_KEY}=1; path=/; expires=${expires}; SameSite=Strict`;
  void value; // cookie hanya digunakan sebagai signal boolean untuk middleware
}

function clearCookie() {
  document.cookie = `${COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

// ─── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<AuthUser | null>(null);
  const [token, setToken]         = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifikasi token saat pertama kali aplikasi dimuat
  useEffect(() => {
    const init = async () => {
      let storedToken: string | null = null;
      let storedUser: AuthUser | null = null;

      try {
        storedToken = localStorage.getItem(LS_TOKEN);
        const raw   = localStorage.getItem(LS_USER);
        if (raw) storedUser = JSON.parse(raw);
      } catch {
        setIsLoading(false);
        return;
      }

      // Tidak ada token → langsung selesai loading
      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      // Ada token → verifikasi ke server
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const json = await res.json();
          // Update user data terkini dari server
          const freshUser: AuthUser = json.data.user;
          setToken(storedToken);
          setUser(freshUser);
          // Update localStorage dengan data terbaru
          localStorage.setItem(LS_USER, JSON.stringify(freshUser));
        } else {
          // Token tidak valid / kedaluwarsa → auto logout
          localStorage.removeItem(LS_TOKEN);
          localStorage.removeItem(LS_USER);
          clearCookie();
        }
      } catch {
        // Network error → gunakan data cached (offline tolerance)
        setToken(storedToken);
        setUser(storedUser);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // ── login ─────────────────────────────────────────────────────
  const login = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem(LS_TOKEN, newToken);
    localStorage.setItem(LS_USER, JSON.stringify(newUser));
    setCookie(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── logout ────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const currentToken = localStorage.getItem(LS_TOKEN);

    // Bersihkan state lokal terlebih dahulu (instant UX)
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    clearCookie();
    setToken(null);
    setUser(null);

    // Opsional: beritahu server (fire-and-forget)
    if (currentToken) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
      }).catch(() => {/* ignore */});
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return ctx;
}
