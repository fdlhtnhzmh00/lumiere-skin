/**
 * app/page.tsx — Homepage LUMIÈRE SKIN
 * Server Component: data produk dan kategori di-fetch langsung via Prisma.
 */

import React from "react";
import Link from "next/link";
import { ArrowRight, Leaf, Shield, Truck, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryCard } from "@/components/products/CategoryCard";

// ─── Data fetching ────────────────────────────────────────────
async function getHomeData() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  return { categories, featuredProducts };
}

function BenefitCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 p-6">
      <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center">
        <Icon size={22} className="text-brand-600" />
      </div>
      <div>
        <p className="font-semibold text-sm text-warm-900">{title}</p>
        <p className="text-xs text-warm-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────
export default async function HomePage() {
  const { categories, featuredProducts } = await getHomeData();

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative min-h-[88vh] flex items-center bg-gradient-to-br from-warm-50 via-brand-50/30 to-rose-50/50 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-16 right-0 w-96 h-96 rounded-full bg-brand-100/40 blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-rose-100/40 blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gold-300/30 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 lg:py-0">
          <div className="max-w-2xl animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-100/80 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-brand-200/50">
              <Star size={11} className="fill-brand-500 text-brand-500" />
              Premium Skincare Collection 2026
            </div>

            {/* Heading */}
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-semibold leading-tight text-warm-900 mb-5">
              Illuminate<br />
              <span className="text-brand-500">Your Natural</span><br />
              Beauty
            </h1>

            {/* Tagline */}
            <p className="text-lg text-warm-600 leading-relaxed mb-8 max-w-lg">
              Temukan rutinitas skincare sempurna Anda dengan koleksi produk
              perawatan kulit premium yang telah teruji secara dermatologis.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-brand-600 transition-colors shadow-md shadow-brand-200"
              >
                Belanja Sekarang
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/products?category=serum-ampoule"
                className="inline-flex items-center gap-2 bg-white text-warm-800 px-6 py-3 rounded-xl font-medium text-sm border border-warm-300 hover:border-brand-300 hover:text-brand-600 transition-colors"
              >
                Lihat Serum
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-warm-200/60">
              {[
                { value: "58+", label: "Produk" },
                { value: "10", label: "Kategori" },
                { value: "100%", label: "Cruelty Free" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-2xl font-semibold text-warm-900">{s.value}</p>
                  <p className="text-xs text-warm-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ BENEFITS ══════════════════════════════════════════ */}
      <section className="bg-white border-y border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-warm-200">
            <BenefitCard icon={Leaf}   title="Bahan Alami"          desc="Formula bebas bahan berbahaya" />
            <BenefitCard icon={Shield} title="Teruji Dermatologis"  desc="Aman untuk semua jenis kulit" />
            <BenefitCard icon={Truck}  title="Pengiriman Cepat"     desc="Dikirim ke seluruh Indonesia" />
            <BenefitCard icon={Star}   title="Kualitas Premium"     desc="Dipilih oleh ahli kecantikan" />
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ════════════════════════════════════════ */}
      <section className="py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">Koleksi Kami</p>
              <h2 className="font-heading text-3xl font-semibold text-warm-900">Kategori Produk</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ══════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">Pilihan Terbaik</p>
              <h2 className="font-heading text-3xl font-semibold text-warm-900">Produk Unggulan</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              Semua Produk <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-warm-900 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-warm-800 transition-colors"
            >
              Lihat Semua Produk
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ BRAND STORY ════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-r from-brand-50 to-rose-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">Tentang Kami</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-warm-900">
              Kecantikan Dimulai dari Perawatan yang Tepat
            </h2>
            <p className="text-warm-600 leading-relaxed">
              LUMIÈRE SKIN hadir dengan keyakinan bahwa setiap orang berhak mendapatkan
              produk skincare berkualitas tinggi. Kami menghadirkan koleksi produk yang
              diformulasikan dengan bahan-bahan terbaik, ramah kulit, dan telah teruji
              secara ilmiah untuk membantu Anda meraih kulit yang sehat dan bercahaya.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-brand-600 font-medium text-sm hover:text-brand-700 border-b border-brand-300 pb-0.5"
            >
              Mulai Perjalanan Skincare Anda <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═════════════════════════════════════════ */}
      <section className="py-16 bg-warm-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-semibold text-white mb-3">
            Siap Memulai Rutinitas Skincare Anda?
          </h2>
          <p className="text-warm-400 mb-7 text-sm">
            Jelajahi ratusan produk skincare premium pilihan para ahli kecantikan.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-brand-500 text-white px-7 py-3.5 rounded-xl font-medium text-sm hover:bg-brand-400 transition-colors"
          >
            Belanja Sekarang <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
