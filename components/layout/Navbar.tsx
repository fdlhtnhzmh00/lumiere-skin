"use client";

/**
 * components/layout/Navbar.tsx
 * Navigasi utama LUMIÈRE SKIN.
 * Responsif — hamburger menu di mobile.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Produk" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-warm-200"
          : "bg-white border-b border-warm-200"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-heading text-xl font-semibold tracking-wide text-warm-900">
              LUMIÈRE <span className="text-brand-500">SKIN</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-brand-600",
                  pathname === link.href
                    ? "text-brand-600 border-b-2 border-brand-500 pb-0.5"
                    : "text-warm-600"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center gap-2">

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-warm-100 transition-colors"
              aria-label="Keranjang"
            >
              <ShoppingBag size={20} className="text-warm-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-[10px] font-bold bg-brand-500 text-white rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-warm-100 transition-colors text-sm font-medium text-warm-700"
                >
                  <User size={16} />
                  <span className="max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown size={14} className={cn("transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-warm-200 py-1 z-50">
                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                    >
                      <ShoppingBag size={14} />
                      Pesanan Saya
                    </Link>
                    <hr className="my-1 border-warm-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm font-medium bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Right */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/cart" className="relative p-2">
              <ShoppingBag size={20} className="text-warm-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-brand-500 text-white rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md hover:bg-warm-100 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-warm-200 bg-white px-4 py-4 space-y-1 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-brand-50 text-brand-600"
                  : "text-warm-700 hover:bg-warm-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-warm-100 my-2" />
          {isAuthenticated ? (
            <>
              <Link
                href="/orders"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-warm-700 hover:bg-warm-50"
              >
                Pesanan Saya
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium bg-brand-500 text-white text-center"
            >
              Masuk
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
