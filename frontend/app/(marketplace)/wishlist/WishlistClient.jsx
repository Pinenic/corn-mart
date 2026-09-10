"use client";
import Link from "next/link";
import { Heart, LogIn } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import useAuthStore from "@/lib/store/useAuthStore";
import { WishlistItemCard } from "@/components/wishlist/WishlistItemCard";
import { Skeleton } from "@/components/ui";

export function WishlistClient() {
  const { user } = useAuthStore();
  const items = useWishlistStore((s) => s.items);
  const loading = useWishlistStore((s) => s.loading);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <LogIn size={40} className="text-[var(--color-text-muted)] mx-auto mb-4" />
        <h1 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-2">
          Sign in to view your wishlist
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
          Save products you're interested in and find them here later.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/sign-in">
            <button className="h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">
              Sign in
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="h-11 px-6 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[var(--color-text-secondary)] text-[13px] font-semibold hover:bg-[var(--color-bg)] transition-colors">
              Create account
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] mb-1">Wishlist</h1>
      <p className="text-[13px] text-[var(--color-text-secondary)] mb-8">
        {items.length} item{items.length !== 1 ? "s" : ""} saved
      </p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-bg)] rounded-[var(--radius)] overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart size={40} className="text-[var(--color-text-muted)] mb-4" />
          <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            Your wishlist is empty
          </p>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 mb-4">
            Tap the heart on any product to save it here
          </p>
          <Link href="/marketplace/products">
            <button className="h-10 px-5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">
              Browse Products
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <WishlistItemCard key={item.key} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}