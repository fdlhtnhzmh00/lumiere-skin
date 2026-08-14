/**
 * components/layout/Footer.tsx
 * LUMIÈRE SKIN — Footer v2.0
 */

import Link from "next/link";
import { Mail, MapPin, Heart } from "lucide-react";

const CATEGORIES = [
  { label: "Face Cleanser",      href: "/products?category=pembersih-wajah" },
  { label: "Toner & Essence",    href: "/products?category=toner-essence" },
  { label: "Serum & Ampoule",    href: "/products?category=serum-ampoule" },
  { label: "Moisturizer & Cream",href: "/products?category=pelembap-krim" },
  { label: "Sunscreen",          href: "/products?category=tabir-surya" },
  { label: "Face Mask",          href: "/products?category=masker-wajah" },
  { label: "Eye Care",           href: "/products?category=perawatan-mata" },
  { label: "Lip Care",           href: "/products?category=perawatan-bibir" },
  { label: "Exfoliator",         href: "/products?category=eksfoliator" },
  { label: "Acne Care",          href: "/products?category=perawatan-jerawat" },
];

const QUICK_LINKS = [
  { label: "Shop All",     href: "/products" },
  { label: "My Orders",    href: "/orders" },
  { label: "Cart",         href: "/cart" },
  { label: "Sign In",      href: "/login" },
];

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">

      {/* ── Main Footer Content ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-5">
            <div>
              <p className="font-heading text-2xl font-semibold text-white tracking-widest">
                LUMIÈRE <span className="text-sage-400 font-light">SKIN</span>
              </p>
              <p className="text-xs text-sage-400 mt-1 italic tracking-wide">
                Illuminate Your Natural Beauty
              </p>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
              Premium skincare formulated with clean, powerful ingredients
              that truly care for your skin.
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href="mailto:hello@lumiereskin.com"
                className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-sage-700 transition-colors"
                aria-label="Email us"
              >
                <Mail size={15} className="text-stone-300" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-sage-700 transition-colors"
                aria-label="Follow us"
              >
                <Heart size={15} className="text-stone-300" />
              </a>
            </div>
          </div>

          {/* Shop by Category */}
          <div className="space-y-4 sm:col-span-1">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest">
              Shop by Category
            </h4>
            <ul className="space-y-2 grid grid-cols-2 gap-x-4">
              {CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-xs text-stone-400 hover:text-sage-400 transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-sage-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-stone-400">
                <MapPin size={14} className="mt-0.5 shrink-0 text-sage-500" />
                <span>Jl. Sultan Alauddin No. 259,<br />Makassar, South Sulawesi</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <Mail size={14} className="shrink-0 text-sage-500" />
                <a href="mailto:hello@lumiereskin.com" className="hover:text-sage-400 transition-colors">
                  hello@lumiereskin.com
                </a>
              </li>
            </ul>
            <div className="pt-1">
              <p className="text-xs text-stone-500 mb-2">Payment Methods</p>
              <div className="flex gap-1.5 flex-wrap">
                {["Transfer", "COD", "E-Wallet"].map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 text-[10px] bg-stone-800 text-stone-400 rounded-md border border-stone-700"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ──────────────────────────────────────────── */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} LUMIÈRE SKIN. All rights reserved.
          </p>
          <p className="text-xs text-stone-600">
            UTS Project — Advanced Software Testing &amp; Quality Assurance
          </p>
        </div>
      </div>
    </footer>
  );
}
