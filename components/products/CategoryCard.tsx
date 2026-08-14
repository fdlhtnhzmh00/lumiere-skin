"use client";

/**
 * components/products/CategoryCard.tsx
 */
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const FALLBACK_GRADIENTS = [
  "from-rose-100 to-pink-200",
  "from-amber-100 to-yellow-200",
  "from-violet-100 to-purple-200",
  "from-teal-100 to-cyan-200",
  "from-sky-100 to-blue-200",
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
      className="group relative overflow-hidden rounded-2xl aspect-square bg-warm-100 block"
    >
      {cat.imageUrl && !imgErr ? (
        <Image
          src={cat.imageUrl}
          alt={cat.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500 brightness-90 group-hover:brightness-100"
          onError={() => setImgErr(true)}
          sizes="(max-width: 640px) 50vw, 20vw"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${FALLBACK_GRADIENTS[gradIdx]}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-warm-900/70 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white text-xs font-semibold line-clamp-1">{cat.name}</p>
        <p className="text-white/70 text-[10px]">{cat._count.products} produk</p>
      </div>
    </Link>
  );
}
