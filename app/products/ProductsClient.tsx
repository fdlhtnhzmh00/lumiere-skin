"use client";

/**
 * app/products/ProductsClient.tsx
 * Katalog produk dengan filter kategori dan pencarian.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { cn } from "@/lib/utils";

interface Product {
  id: string; name: string; slug: string; price: number; stock: number;
  imageUrl: string; description: string;
  category: { name: string; slug: string };
}
interface Category { id: string; name: string; slug: string; productCount: number; }

export function ProductsClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState(searchParams.get("search") ?? "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "");
  const [mobileFilter, setMobileFilter] = useState(false);

  const fetchProducts = useCallback(async (cat: string, q: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "60" });
    if (cat) params.set("category", cat);
    if (q.trim()) params.set("search", q.trim());
    const res  = await fetch(`/api/products?${params}`);
    const json = await res.json();
    setProducts(json.data?.products ?? []);
    setTotal(json.data?.total ?? 0);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const res  = await fetch("/api/categories");
    const json = await res.json();
    setCategories(json.data?.categories ?? []);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    const cat = searchParams.get("category") ?? "";
    const q   = searchParams.get("search") ?? "";
    setActiveCategory(cat);
    setSearch(q);
    fetchProducts(cat, q);
  }, [searchParams, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(activeCategory, search);
  };

  const handleCategory = (slug: string) => {
    const next = slug === activeCategory ? "" : slug;
    setActiveCategory(next);
    const url  = next ? `/products?category=${next}` : "/products";
    router.replace(url, { scroll: false });
    setMobileFilter(false);
  };

  const activeCatName = categories.find((c) => c.slug === activeCategory)?.name;

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl font-semibold text-warm-900">
            {activeCatName ?? "Semua Produk"}
          </h1>
          <p className="text-sm text-warm-500 mt-1">
            {loading ? "Memuat..." : `${total} produk ditemukan`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-warm-200 p-4 sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-warm-400 mb-3">Kategori</p>
            <ul className="space-y-0.5">
              <li>
                <button onClick={() => handleCategory("")}
                  className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    activeCategory === "" ? "bg-brand-100 text-brand-700 font-medium" : "text-warm-600 hover:bg-warm-50")}>
                  Semua Produk
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button onClick={() => handleCategory(cat.slug)}
                    className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      activeCategory === cat.slug ? "bg-brand-100 text-brand-700 font-medium" : "text-warm-600 hover:bg-warm-50")}>
                    {cat.name}
                    <span className="float-right text-xs text-warm-400">{cat.productCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Konten */}
        <div className="flex-1 min-w-0">
          {/* Search + mobile filter */}
          <div className="flex gap-2 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk skincare..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400" />
            </form>
            <button onClick={() => setMobileFilter(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-warm-300 rounded-xl text-sm font-medium text-warm-600">
              <SlidersHorizontal size={15} /> Filter
            </button>
          </div>

          {activeCatName && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-warm-500">Filter:</span>
              <button onClick={() => handleCategory("")}
                className="flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-brand-200">
                {activeCatName} <X size={11} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-warm-200">
                  <div className="skeleton aspect-square" />
                  <div className="p-3.5 space-y-2">
                    <div className="skeleton h-3 w-16 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-8 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-warm-600 font-medium">Produk tidak ditemukan</p>
              <button onClick={() => { setSearch(""); setActiveCategory(""); fetchProducts("", ""); }}
                className="mt-4 text-sm text-brand-600 hover:underline">Reset filter</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilter(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold">Filter Kategori</p>
              <button onClick={() => setMobileFilter(false)}><X size={18} /></button>
            </div>
            <ul className="space-y-0.5">
              <li>
                <button onClick={() => handleCategory("")}
                  className={cn("w-full text-left px-3 py-2.5 rounded-lg text-sm",
                    activeCategory === "" ? "bg-brand-100 text-brand-700 font-medium" : "text-warm-600")}>
                  Semua Produk
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button onClick={() => handleCategory(cat.slug)}
                    className={cn("w-full text-left px-3 py-2.5 rounded-lg text-sm",
                      activeCategory === cat.slug ? "bg-brand-100 text-brand-700 font-medium" : "text-warm-600")}>
                    {cat.name} ({cat.productCount})
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
