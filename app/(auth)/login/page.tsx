"use client";

/**
 * app/(auth)/login/page.tsx — Login v2.0
 */

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { getSafeCallbackUrl } from "@/lib/utils";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const callbackUrl  = getSafeCallbackUrl(searchParams.get("callbackUrl"), "/");

  const [form, setForm]         = useState({ identifier: "", password: "" });
  const [errors, setErrors]     = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) router.replace(callbackUrl);
  }, [isAuthenticated, callbackUrl, router]);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.identifier.trim()) e.identifier = "Email or username is required";
    if (!form.password)          e.password   = "Password is required";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: form.identifier.trim(), password: form.password }) });
      const json = await res.json();
      if (!res.ok) { setApiError(json.message ?? "Invalid credentials. Please try again."); return; }
      login(json.data.token, json.data.user);
      router.replace(callbackUrl);
    } catch { setApiError("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-heading text-3xl font-semibold tracking-widest text-stone-900">
              LUMIÈRE <span className="text-sage-600 font-light">SKIN</span>
            </span>
          </Link>
          <p className="text-xs text-stone-400 mt-1 italic tracking-wide">Illuminate Your Natural Beauty</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-8 card-shadow">
          <h2 className="font-heading text-2xl text-stone-900 mb-1">Welcome Back</h2>
          <p className="text-sm text-stone-400 mb-6">Sign in to continue your skincare journey</p>

          {/* Demo account */}
          <div className="bg-sage-50 border border-sage-200 rounded-xl px-4 py-3 mb-5 text-xs text-sage-800 space-y-1">
            <p className="font-bold text-sage-700">Demo Account</p>
            <p>📧 user@lumiereskin.com</p>
            <p>🔑 Lumiere123!</p>
          </div>

          {/* Error */}
          {apiError && (
            <div data-testid="login-error" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Identifier */}
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="block text-xs font-bold uppercase tracking-widest text-stone-500">
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                data-testid="login-identifier"
                placeholder="Enter email or username"
                value={form.identifier}
                onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                autoComplete="username"
                className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 placeholder:text-stone-300 ${errors.identifier ? "border-red-300 focus:ring-red-100" : "border-stone-200 focus:ring-sage-100 focus:border-sage-400"}`}
              />
              {errors.identifier && <p className="text-xs text-red-600">{errors.identifier}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-stone-500">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  data-testid="login-password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  className={`w-full pr-11 pl-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 placeholder:text-stone-300 ${errors.password ? "border-red-300 focus:ring-red-100" : "border-stone-200 focus:ring-sage-100 focus:border-sage-400"}`}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            <button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing In...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-5">
            Want to browse first?{" "}
            <Link href="/products" className="text-sage-600 font-semibold hover:text-sage-800 transition-colors">
              Explore our products
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-sage-200 border-t-sage-600 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
