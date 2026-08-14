"use client";

/**
 * components/layout/Navbar.tsx
 * LUMIÈRE SKIN — Navigation v2.0
 * Inspired by clean luxury skincare brand navigation
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown, Search } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",          label: "Home",         primary: true },
  { href: "/products",  label: "Shop All",     primary: true },
  { href: "/products",  label: "Best Sellers", primary: false },
  { href: "/products",  label: "Skincare",     primary: false },
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
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      {/* ── Announcement Bar ─────────────────────────────────── */}
      <div className="announcement-bar hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8">
          <span className="flex items-center gap-1.5">
            <span className="text-sage-300">✓</span> Clean Ingredients
          </span>
          <span className="text-stone-500">◆</span>
          <span className="flex items-center gap-1.5">
            <span className="text-sage-300">✓</span> Dermatologist Tested
          </span>
          <span className="text-stone-500">◆</span>
          <span className="flex items-center gap-1.5">
            <span className="text-sage-300">✓</span> Cruelty Free
          </span>
          <span className="text-stone-500">◆</span>
          <span className="flex items-center gap-1.5">
            <span className="text-sage-300">✓</span> Made for Real Beauty
          </span>
        </div>
      </div>

      {/* ── Main Navigation ──────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-white transition-all duration-200",
          scrolled ? "shadow-sm border-b border-stone-200" : "border-b border-stone-100"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">

            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center gap-0.5 mr-auto lg:mr-0">
              <span className="font-heading text-lg font-semibold tracking-widest text-stone-900">
                LUMIÈRE
              </span>
              <span className="font-heading text-lg font-light tracking-widest text-sage-600 ml-1">
                SKIN
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-sage-700",
                    link.primary && pathname === link.href
                      ? "text-sage-700 border-b-2 border-sage-600 pb-0.5"
                      : "text-stone-600"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1 ml-auto lg:ml-0">

              {/* Search */}
              <Link
                href="/products"
                className="p-2 rounded-full hover:bg-stone-100 transition-colors hidden sm:flex"
                aria-label="Search products"
              >
                <Search size={18} className="text-stone-600" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingBag size={18} className="text-stone-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-[10px] font-bold bg-sage-600 text-white rounded-full flex items-center justify-center leading-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {/* User / Auth */}
              {isAuthenticated ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700"
                  >
                    <User size={16} />
                    <span className="max-w-[90px] truncate">{user?.name}</span>
                    <ChevronDown
                      size={13}
                      className={cn("transition-transform", userMenuOpen && "rotate-180")}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-stone-100">
                        <p className="text-xs text-stone-400">Signed in as</p>
                        <p className="text-sm font-semibold text-stone-800 truncate">{user?.name}</p>
                      </div>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <ShoppingBag size={14} />
                        My Orders
                      </Link>
                      <hr className="my-1 border-stone-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-sage-600 text-white rounded-full hover:bg-sage-700 transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-stone-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────────── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-stone-100 bg-white px-4 py-5 space-y-1 animate-fade-in">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  link.primary && pathname === link.href
                    ? "bg-sage-50 text-sage-700"
                    : "text-stone-700 hover:bg-stone-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-stone-100 my-2" />
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-xs text-stone-400">Signed in as</p>
                  <p className="text-sm font-semibold text-stone-800">{user?.name}</p>
                </div>
                <Link
                  href="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  My Orders
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold bg-sage-600 text-white text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
