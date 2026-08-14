/**
 * components/layout/Footer.tsx
 */

import Link from "next/link";
import { Mail, MapPin, Heart } from "lucide-react";

const CATEGORIES = [
  { label: "Pembersih Wajah", href: "/products?category=pembersih-wajah" },
  { label: "Toner & Essence",  href: "/products?category=toner-essence" },
  { label: "Serum & Ampoule", href: "/products?category=serum-ampoule" },
  { label: "Pelembap & Krim", href: "/products?category=pelembap-krim" },
  { label: "Tabir Surya",     href: "/products?category=tabir-surya" },
];

export function Footer() {
  return (
    <footer className="bg-warm-900 text-warm-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <span className="font-heading text-2xl font-semibold text-white tracking-wide">
              LUMIÈRE <span className="text-brand-400">SKIN</span>
            </span>
            <p className="text-sm leading-relaxed text-warm-400 max-w-xs">
              Illuminate Your Natural Beauty. Koleksi skincare premium untuk
              merawat dan memancarkan kecantikan alami Anda.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-warm-800 flex items-center justify-center hover:bg-brand-600 transition-colors"
              >
                <Heart size={16} className="text-warm-300" />
              </a>
              <a
                href="mailto:hello@lumiereskin.com"
                className="w-9 h-9 rounded-full bg-warm-800 flex items-center justify-center hover:bg-brand-600 transition-colors"
              >
                <Mail size={16} className="text-warm-300" />
              </a>
            </div>
          </div>

          {/* Kategori */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest">
              Kategori
            </h4>
            <ul className="space-y-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-warm-400 hover:text-brand-400 transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest">
              Informasi
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-warm-400">
                <MapPin size={14} className="mt-0.5 shrink-0 text-brand-400" />
                <span>Jl. Sultan Alauddin No. 259,<br />Makassar, Sulawesi Selatan</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-warm-400">
                <Mail size={14} className="shrink-0 text-brand-400" />
                <span>hello@lumiereskin.com</span>
              </li>
            </ul>
            <div className="pt-2 space-y-1.5">
              <p className="text-xs text-warm-500">Metode Pembayaran</p>
              <div className="flex gap-2">
                {["Transfer", "COD", "E-Wallet"].map((m) => (
                  <span
                    key={m}
                    className="px-2 py-1 text-[10px] bg-warm-800 text-warm-300 rounded-md"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-warm-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-warm-500">
            © {new Date().getFullYear()} LUMIÈRE SKIN. Semua hak dilindungi.
          </p>
          <p className="text-xs text-warm-600">
            Proyek UTS — Advanced Software Testing &amp; Quality Assurance
          </p>
        </div>
      </div>
    </footer>
  );
}
