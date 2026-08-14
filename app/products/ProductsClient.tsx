"use client";

/**
 * app/products/ProductsClient.tsx
 * Product listing page — v2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
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

  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState(searchParams.get("search") ?? "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "");
  const [mobileFilter, setMobileFilter]     = useState(false);

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
    router.replace(next ? `/products?category=${next}` : "/products", { scroll: false });
    setMobileFilter(false);
  };

  const activeCatName = categories.find((c) => c.slug === activeCategory)?.name;

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Page Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="label-overline text-sage-600 mb-2">Our Collection</p>
          <h1 className="font-heading text-4xl text-stone-900">
            {activeCatName ?? "All Products"}
          </h1>
          <p className="text-stone-500 mt-2 text-sm">
            {loading ? "Loading..." : `${total} product${total !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-8">

        {/* ── Sidebar desktop ─────────────────────────────────── */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky top-24">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
              Categories
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => handleCategory("")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    activeCategory === ""
                      ? "bg-sage-50 text-sage-700 font-semibold"
                      : "text-stone-600 hover:bg-stone-50"
                  )}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => handleCategory(cat.slug)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                      activeCategory === cat.slug
                        ? "bg-sage-50 text-sage-700 font-semibold"
                        : "text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    {cat.name}
                    <span className="text-[10px] text-stone-400">{cat.productCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Search + Filter row */}
          <div className="flex gap-2 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skincare products..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400 placeholder:text-stone-400"
              />
            </form>
            <button
              onClick={() => setMobileFilter(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-600"
            >
              <SlidersHorizontal size={15} />
              Filter
              <ChevronDown size={13} />
            </button>
          </div>

          {/* Active filter */}
          {activeCatName && (
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-stone-400">Filtered by:</span>
              <button
                onClick={() => handleCategory("")}
                className="flex items-center gap-1 bg-sage-50 text-sage-700 text-xs font-semibold px-3 py-1 rounded-full border border-sage-200 hover:bg-sage-100"
              >
                {activeCatName} <X size={11} />
              </button>
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-16 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-8 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-heading text-xl text-stone-700 mb-2">No products found</p>
              <p className="text-sm text-stone-400 mb-5">Try adjusting your search or filter</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory(""); fetchProducts("", ""); }}
                className="text-sm font-semibold text-sage-600 hover:text-sage-800 transition-colors"
              >
                Clear all filters →
              </button>
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilter(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-stone-900">Filter by Category</p>
              <button onClick={() => setMobileFilter(false)} className="p-1.5 rounded-lg hover:bg-stone-100">
                <X size={18} />
              </button>
            </div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleCategory("")}
                  className={cn("w-full text-left px-3 py-2.5 rounded-lg text-sm",
                    activeCategory === "" ? "bg-sage-50 text-sage-700 font-semibold" : "text-stone-600"
                  )}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => handleCategory(cat.slug)}
                    className={cn("w-full text-left px-3 py-2.5 rounded-lg text-sm flex justify-between",
                      activeCategory === cat.slug ? "bg-sage-50 text-sage-700 font-semibold" : "text-stone-600"
                    )}
                  >
                    {cat.name}
                    <span className="text-[10px] text-stone-400">{cat.productCount}</span>
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
