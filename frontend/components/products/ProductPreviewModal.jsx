"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, ExternalLink, ChevronRight, Package } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button, Badge } from "@/components/ui";
import { VariantSelector } from "./VariantSelector";
import {useCartStore} from "@/lib/store/cartStore";
import { toast } from "@/lib/store/toastStore";
import { formatPrice, truncate } from "@/lib/utils";
import { useProduct } from "@/lib/hooks/useProducts";

export function ProductPreviewModal({ product: initial, open, onClose }) {
  // Fetch full product data (with variants) when modal opens
  const { product, isLoading } = useProduct(open ? initial?.id : null);
  const full = product ?? initial;
  console.log(full)

  const [selectedVariant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const addItem  = useCartStore(s => s.addItem);
  const openCart = useCartStore(s => s.openCart);

  const effectiveVariant = selectedVariant ?? full?.variants?.[0] ?? null;
  const price            = effectiveVariant?.price ?? full?.price;
  const stock            = effectiveVariant?.stock ?? full?.stock ?? 0;
  const outOfStock       = stock <= 0;

  const handleAdd = () => {
    addItem(full, effectiveVariant, qty, effectiveVariant.stock);
    // toast.success(`${truncate(full.name, 25)} added to cart`);
    openCart();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      {isLoading && !full ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : full ? (
        <div className="flex flex-col md:flex-row gap-0">
          {/* Image */}
          <div className="md:w-1/2 bg-[var(--color-bg)] aspect-square md:aspect-auto md:min-h-[400px] flex items-center justify-center flex-shrink-0">
            {full.thumbnail_url
              ? <img src={full.thumbnail_url} alt={full.name} className="w-full h-full object-cover" />
              : <Package size={64} className="text-[var(--color-text-muted)]" />
            }
          </div>

          {/* Details */}
          <div className="md:w-1/2 flex flex-col p-5 gap-4">
            {full.store && (
              <Link href={`/marketplace/stores/${full.store_id}`} className="text-[12px] font-medium text-[var(--color-primary)] hover:underline">
                {full.store.name}
              </Link>
            )}
            <div>
              <p className="text-[18px] font-bold text-[var(--color-text-primary)] leading-snug">{full.name}</p>
              {full.brand && <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">{full.brand}</p>}
            </div>

            <p className="text-[24px] font-bold text-[var(--color-primary)]">{formatPrice(price)}</p>

            {full.description && (
              <p className="text-[13px] text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">{full.description}</p>
            )}

            {/* Variants */}
            {full.variants?.length >= 1 && (
              <VariantSelector variants={full.variants} selected={selectedVariant} onSelect={setVariant} />
            )}

            {/* Stock */}
            {!outOfStock && stock <= 5 && (
              <p className="text-[12px] font-medium text-[var(--color-warning)]">⚡ Only {stock} left</p>
            )}
            {!outOfStock && stock >= 5 && (
              <p className="text-[12px] font-medium text-[var(--color-info)]"> {stock} available</p>
            )}

            {/* Qty + Add */}
            <div className="flex items-center gap-3 mt-auto pt-2">
              {/* Qty picker */}
              <div className="flex items-center border border-[var(--color-border-md)] rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] font-bold">−</button>
                <span className="w-8 text-center text-[13px] font-semibold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(stock || 99, q+1))} className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] font-bold">+</button>
              </div>
              <Button className="flex-1" disabled={outOfStock} onClick={handleAdd}>
                <ShoppingCart size={15} />
                {outOfStock ? "Out of stock" : "Add to cart"}
              </Button>
            </div>

            {/* View full page link */}
            <Link href={`/marketplace/products/${full.id}`} className="flex items-center gap-1 text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors" onClick={onClose}>
              View full details <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
