"use client";

/**
 * app/(auth)/login/page.tsx
 *
 * Halaman Login LUMIÈRE SKIN.
 * Mendukung callbackUrl: setelah login berhasil, pengguna diarahkan
 * kembali ke halaman yang sebelumnya ingin dikunjungi.
 *
 * Contoh URL: /login?callbackUrl=%2Fcheckout
 * → Setelah login → redirect ke /checkout
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSafeCallbackUrl } from "@/lib/utils";

function LoginForm() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  // Ambil callbackUrl dari query string
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"), "/");

  const [form, setForm]         = useState({ identifier: "", password: "" });
  const [errors, setErrors]     = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  // Jika sudah login, redirect langsung
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(callbackUrl);
    }
  }, [isAuthenticated, callbackUrl, router]);

  const validate = (): boolean => {
    const e: Partial<typeof form> = {};
    if (!form.identifier.trim()) e.identifier = "Email atau username wajib diisi";
    if (!form.password)          e.password   = "Password wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          identifier: form.identifier.trim(),
          password:   form.password,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setApiError(json.message ?? "Email/username atau password salah");
        return;
      }

      // Simpan token dan data user ke state
      login(json.data.token, json.data.user);

      // Redirect ke callbackUrl atau homepage
      router.replace(callbackUrl);
    } catch {
      setApiError("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const showCallback = callbackUrl !== "/" && callbackUrl !== "";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-warm-50 to-brand-50/30 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Back link */}
        <Link
          href={callbackUrl !== "/" ? callbackUrl : "/products"}
          className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-brand-600 mb-5 transition-colors"
        >
          <ArrowLeft size={14} />
          {showCallback ? "Kembali" : "Jelajahi Produk"}
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-warm-200/60 overflow-hidden">

          {/* Header brand */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-8 text-white text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="font-heading text-2xl font-semibold">LUMIÈRE SKIN</h1>
            <p className="text-brand-100 text-sm mt-1">Illuminate Your Natural Beauty</p>
          </div>

          {/* Form body */}
          <div className="p-8 space-y-5">
            <div>
              <h2 className="font-heading text-xl font-semibold text-warm-900">
                Masuk ke Akun
              </h2>
              <p className="text-sm text-warm-500 mt-1">
                {showCallback
                  ? "Masuk terlebih dahulu untuk melanjutkan"
                  : "Masuk untuk mulai berbelanja"}
              </p>
            </div>

            {/* Info callback */}
            {showCallback && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-2.5 rounded-xl">
                Setelah masuk, Anda akan diarahkan ke halaman tujuan.
              </div>
            )}

            {/* Demo account info */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-3.5 text-xs text-brand-700 space-y-1">
              <p className="font-semibold text-xs mb-0.5">Akun Demo:</p>
              <p>📧 user@lumiereskin.com</p>
              <p>🔑 Lumiere123!</p>
            </div>

            {/* API error */}
            {apiError && (
              <div
                data-testid="login-error"
                className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
              >
                {apiError}
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                id="identifier"
                label="Email atau Username"
                type="text"
                placeholder="Masukkan email atau username"
                value={form.identifier}
                onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                error={errors.identifier}
                required
                autoComplete="username"
                data-testid="login-identifier"
              />

              {/* Password dengan toggle show/hide */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-warm-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    autoComplete="current-password"
                    data-testid="login-password"
                    className="w-full pr-11 pl-3.5 py-2.5 text-sm bg-white border rounded-xl transition-colors placeholder:text-warm-400 text-warm-900 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 border-warm-300 hover:border-warm-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2"
                loading={loading}
                data-testid="login-submit"
              >
                Masuk
              </Button>
            </form>

            <p className="text-center text-xs text-warm-500">
              Ingin melihat produk?{" "}
              <Link href="/products" className="text-brand-600 font-medium hover:underline">
                Jelajahi tanpa login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dibungkus Suspense karena menggunakan useSearchParams
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
