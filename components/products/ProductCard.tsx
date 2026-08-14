"use client";

/**
 * components/products/ProductCard.tsx
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn, formatCurrency, getLoginUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  category: { name: string; slug: string };
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, isInCart } = useCart();
  const { isAuthenticated }   = useAuth();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const inCart   = isInCart(product.id);
  const outStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Redirect ke login dengan callbackUrl ke halaman produk ini
      router.push(getLoginUrl(`/products/${product.slug}`));
      return;
    }
    if (outStock) return;

    const result = addItem(
      {
        id:           product.id,
        name:         product.name,
        price:        product.price,
        stock:        product.stock,
        imageUrl:     product.imageUrl,
        slug:         product.slug,
        categoryName: product.category.name,
      },
      1
    );

    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-warm-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300">

        {/* Gambar */}
        <div className="relative aspect-square overflow-hidden bg-warm-100">
          {!imgError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
              <span className="text-4xl">✨</span>
            </div>
          )}
          {outStock && (
            <div className="absolute inset-0 bg-warm-900/40 flex items-center justify-center">
              <span className="bg-white text-warm-800 text-xs font-semibold px-3 py-1 rounded-full">
                Stok Habis
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5 space-y-2">
          <Badge variant="brand" className="text-[10px]">
            {product.category.name}
          </Badge>

          <h3 className="text-sm font-medium text-warm-900 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-base font-semibold text-warm-900">
              {formatCurrency(product.price)}
            </span>
            <span className={cn("text-xs", product.stock <= 5 && product.stock > 0 ? "text-amber-600" : "text-warm-400")}>
              {outStock ? "" : product.stock <= 5 ? `Sisa ${product.stock}` : `Stok ${product.stock}`}
            </span>
          </div>

          {/* Tombol Tambah */}
          <button
            onClick={handleAddToCart}
            disabled={outStock}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-all",
              outStock
                ? "bg-warm-100 text-warm-400 cursor-not-allowed"
                : added
                ? "bg-green-500 text-white"
                : inCart
                ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
                : "bg-brand-500 text-white hover:bg-brand-600"
            )}
          >
            {added ? (
              <><Check size={13} />Ditambahkan</>
            ) : inCart ? (
              <><ShoppingBag size={13} />Tambah Lagi</>
            ) : (
              <><ShoppingBag size={13} />Tambah ke Keranjang</>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
