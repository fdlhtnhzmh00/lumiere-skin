/**
 * app/page.tsx — LUMIÈRE SKIN Homepage v2.0
 * Inspired by clean natural luxury skincare aesthetics
 * Server Component — Prisma data fetching
 */

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Eye,
  Shield,
  Package,
  RotateCcw,
  Lock,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryCard } from "@/components/products/CategoryCard";

// ─── Hero image ─────────────────────────────────────────────
const HERO_IMAGE =
  "https://i.ibb.co/21t9yJqm/4431bdaf-d545-4697-bd4e-7b346b3cba6f.jpg";

// ─── Data fetching ────────────────────────────────────────────
async function getHomeData() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where:   { isActive: true },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take:    8,
    }),
  ]);
  return { categories, featuredProducts };
}

// ─── Hero Trust Icons ─────────────────────────────────────────
const HERO_FEATURES = [
  { icon: Leaf,   label: "Clean",       sub: "Ingredients" },
  { icon: Eye,    label: "Visible",     sub: "Results" },
  { icon: Shield, label: "Safe for",    sub: "Sensitive Skin" },
  { icon: Leaf,   label: "Natural",     sub: "Packaging" },
];

// ─── Page ─────────────────────────────────────────────────────
export default async function HomePage() {
  const { categories, featuredProducts } = await getHomeData();

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section className="bg-stone-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-0 min-h-[82vh] items-center">

            {/* Left: Text content */}
            <div className="py-16 lg:py-24 lg:pr-12 order-2 lg:order-1">
              <p className="label-overline mb-4 text-sage-600">
                Natural Skincare Collection 2026
              </p>

              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-stone-900 mb-6 leading-tight">
                Good for{" "}
                <span className="italic text-sage-700">your skin.</span>
                <br />
                Better for{" "}
                <span className="italic text-sage-700">you.</span>
              </h1>

              <p className="text-base text-stone-500 mb-8 max-w-md leading-relaxed">
                <em className="font-medium text-stone-700 not-italic">
                  Illuminate Your Natural Beauty
                </em>{" "}
                — high performance skincare with clean, powerful ingredients
                that truly care for you.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-12">
                <Link href="/products" className="btn-primary">
                  Shop Now
                </Link>
                <Link
                  href="/products?category=serum-ampoule"
                  className="btn-outline"
                >
                  Explore Ingredients <ArrowRight size={15} />
                </Link>
              </div>

              {/* Trust icons */}
              <div className="grid grid-cols-4 gap-4">
                {HERO_FEATURES.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-sage-50 border border-sage-100 flex items-center justify-center">
                      <Icon size={17} className="text-sage-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-800 leading-tight">{label}</p>
                      <p className="text-[10px] text-stone-400 leading-tight">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero image */}
            <div className="relative order-1 lg:order-2 h-64 lg:h-full min-h-[320px] lg:min-h-[82vh] bg-stone-100">
              <Image
                src={HERO_IMAGE}
                alt="LUMIÈRE SKIN — Natural Skincare"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle gradient overlay for text readability on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent lg:hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ TRUST / SHIPPING STRIP ════════════════════════════════ */}
      <section className="bg-sage-800 text-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Package,    title: "Free Shipping",    sub: "On all orders over Rp200K" },
              { icon: RotateCcw, title: "30-Day Returns",   sub: "Love it or return it" },
              { icon: Lock,       title: "Secure Checkout",  sub: "100% protected payments" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-4 justify-center sm:justify-start">
                <Icon size={26} className="text-sage-300 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-sage-300">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SHOP BY CATEGORY ══════════════════════════════════════ */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle max-w-xs">
                Everything you need for your best skin days.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-sm font-semibold text-sage-600 hover:text-sage-800 mt-3 transition-colors"
              >
                View All Products <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Category grid — 5 per row desktop, 2 on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ BEST SELLERS ══════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="label-overline text-sage-600 mb-2">Our Favourites</p>
              <h2 className="section-title">Best Sellers</h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-sage-600 hover:text-sage-800 transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {featuredProducts.map((product) => (
              <Suspense key={product.id} fallback={<div className="skeleton aspect-square rounded-2xl" />}>
                <ProductCard product={product} />
              </Suspense>
            ))}
          </div>

          {/* Mobile "view all" */}
          <div className="text-center mt-8 sm:hidden">
            <Link href="/products" className="btn-primary inline-flex gap-2">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ BRAND STORY ═══════════════════════════════════════════ */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <p className="label-overline text-sage-600">Our Philosophy</p>
            <h2 className="section-title">
              Beauty Starts with the Right Care
            </h2>
            <p className="text-stone-500 leading-relaxed">
              LUMIÈRE SKIN was founded on the belief that everyone deserves
              access to effective, clean skincare. We formulate every product
              with carefully selected ingredients, dermatologist-tested and
              gentle for all skin types, to help you achieve healthy,
              luminous skin naturally.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sage-700 font-semibold text-sm hover:text-sage-900 border-b border-sage-400 pb-0.5 transition-colors"
            >
              Start Your Skincare Journey <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ════════════════════════════════════════════ */}
      <section className="bg-sage-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="label-overline text-sage-300 mb-3">Limited Time</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-white mb-3">
            Ready to illuminate your skin?
          </h2>
          <p className="text-sage-300 text-sm mb-8 max-w-md mx-auto">
            Explore our full collection of premium skincare products
            curated for your natural beauty.
          </p>
          <Link href="/products" className="btn-primary inline-flex gap-2">
            Shop the Collection <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
