"use client";

/**
 * components/products/CategoryCard.tsx
 * LUMIÈRE SKIN — Category Card v2.0
 * Clean image card with name + CTA
 */
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FALLBACK_GRADIENTS = [
  "from-sage-100 to-sage-200",
  "from-stone-100 to-stone-200",
  "from-amber-50 to-amber-100",
  "from-emerald-50 to-emerald-100",
  "from-rose-50 to-rose-100",
];

interface CategoryCardProps {
  cat: {
    name: string;
    slug: string;
    imageUrl: string | null;
    _count: { products: number };
  };
}

export function CategoryCard({ cat }: CategoryCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const gradIdx = cat.name.length % FALLBACK_GRADIENTS.length;

  return (
    <Link
      href={`/products?category=${cat.slug}`}
      className="group block text-center"
    >
      {/* Image container */}
      <div className="relative overflow-hidden rounded-2xl aspect-square bg-stone-100 mb-3">
        {cat.imageUrl && !imgErr ? (
          <Image
            src={cat.imageUrl}
            alt={cat.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgErr(true)}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${FALLBACK_GRADIENTS[gradIdx]} flex items-center justify-center`}
          >
            <span className="text-3xl opacity-30">✨</span>
          </div>
        )}
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300 rounded-2xl" />
      </div>

      {/* Category name */}
      <p className="text-sm font-semibold text-stone-800 group-hover:text-sage-700 transition-colors leading-tight mb-1">
        {cat.name}
      </p>

      {/* Shop Now CTA */}
      <p className="text-xs text-stone-500 group-hover:text-sage-600 transition-colors flex items-center justify-center gap-1">
        Shop Now <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
      </p>
    </Link>
  );
}
