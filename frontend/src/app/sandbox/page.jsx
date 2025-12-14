"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function ProductCard2({ product, view = "list", onClick }) {
  return (
    <div className="flex">
      <div className="flex flex-col w-72 h-96 border-2 gap-3">
        <div className="relative bg-gray-300 p-2 h-fit">
          <div className="absolute top-2 right-2 flex gap-2">
            <button className="p-1.5 rounded-full bg-white shadow hover:bg-gray-100">
              <Heart className="w-4 h-4 text-gray-700" />
            </button>
          </div>
          <img src={product.thumbnail_url} alt={product.name} />
        </div>
        <div className="flex flex-col mt-2">
          <h2>{product.name.toUpperCase()}</h2>
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product, view = "list", onClick }) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={
        view === "grid"
          ? "w-full sm:w-[48%] lg:w-[23%] cursor-pointer"
          : "w-full flex items-center gap-4 cursor-pointer"
      }
      onClick={onClick}
    >
      <Card className="overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-lg transition-all bg-card">
        {view === "grid" ? (
          <>
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={product.thumbnail_url}
                alt={product.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg truncate">{product.name}</h3>
              <p className="text-muted-foreground text-sm truncate mb-2">
                {product.category}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  ${product.price}
                </span>
                <div className="flex items-center text-yellow-500">
                  <Star size={16} />
                  <span className="ml-1 text-sm">{product.rating}</span>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center gap-4 p-4">
            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={product.thumbnail_url}
                alt={product.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col justify-between flex-grow">
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {product.description}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  ${product.price}
                </span>
                <div className="flex items-center text-yellow-500">
                  <Star size={16} />
                  <span className="ml-1 text-sm">{product.rating}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default function Page() {
  const [open, setIsOpen] = useState(false);
  const product = {
    id: "8089df50-d078-4056-a3a1-bd126048bad8",
    store_id: "9fa980ba-e1d9-4983-89f3-b735a77e7e7a",
    name: "Dummy 10",
    description: "Tenth dummy product for test store",
    price: 30,
    stock: 0,
    category: "camera",
    images: null,
    is_active: true,
    created_at: "2025-11-05T15:56:11.488371+00:00",
    updated_at: "2025-11-08T09:46:45.343288+00:00",
    brand: null,
    thumbnail_url:
      "https://dmrtozxqjgoyjcnsmiky.supabase.co/storage/v1/object/public/user_uploads/fa31a398-aaa8-4bc3-aeb4-4332684f116c/8089df50-d078-4056-a3a1-bd126048bad8/c3da82a5-045e-4c61-bc70-05c089b35ae3-Project_20211225_0008.jpg",
  };
  const handleClick = () => {
    setIsOpen(true);
  };
  return (
    <div className="flex flex-col items-center">
      <h1>product card design</h1>
      <ProductCard product={product} onClick={() => setIsOpen(true)} />
      <ProductCardSkeleton product={product} onClick={() => setIsOpen(true)} />
      <ProductCard2 product={product} onClick={() => setIsOpen(true)} />
      {/* <ProductDetailsModal
        product={product}
        open={open}
        onOpenChange={setIsOpen}
      /> */}
      <ProductQuickViewModalSkeleton
        product={product}
        open={open}
        onOpenChange={setIsOpen}
      />
    </div>
  );
}

export function ProductDetailsModal({
  product,
  open,
  onOpenChange,
  onAddToCart,
}) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl overflow-hidden p-0 bg-background">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden"
          >
            <img
              src={product.thumbnail_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col justify-between p-6 space-y-4"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                {product.name}
              </DialogTitle>
              <DialogDescription>{product.category}</DialogDescription>
            </DialogHeader>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-yellow-500">
                <Star size={18} />
                <span className="ml-1 text-sm">{product.rating}</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                ${product.price}
              </span>
            </div>

            {product.variants?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Available Variants</h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, i) => (
                    <Button key={i} variant="outline" size="sm">
                      {variant}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 border-t">
              <Button
                onClick={() => onAddToCart?.(product)}
                className="w-full sm:w-auto"
              >
                Add to Cart
              </Button>
            </DialogFooter>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ProductCardSkeleton.js

export function ProductCardSkeleton({ product, view = "grid", onClick }) {
  // product: { image, name, price, oldPrice, shipping, sold, rating }
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={
        view === "grid"
          ? "w-full sm:w-[48%] lg:w-[23%] cursor-pointer"
          : "w-full flex items-center gap-4 cursor-pointer"
      }
      onClick={onClick}
    >
      <Card className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition">
        {/* static heart icon top-right */}
        <div className="absolute top-3 right-3 z-10">
          <div className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center">
            <Heart className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {view === "grid" ? (
          <>
            <div className="relative h-56 w-full bg-zinc-50">
              {/* expects product.image as string */}
              {product?.image && (
                <Image src={product.image} alt={product.name} fill className="object-contain" />
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-medium text-sm line-clamp-2">{product?.name}</h3>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <div className="text-lg font-bold">${product?.price}</div>
                  {product?.oldPrice && (
                    <div className="text-xs text-muted-foreground line-through">${product.oldPrice}</div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">{product?.rating}</div>
              </div>

              <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
                <div>{product?.shipping || "Free shipping"}</div>
                <div className="text-rose-600 font-medium">{product?.sold && `${product.sold} sold`}</div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center gap-4 p-4">
            <div className="relative w-28 h-28 flex-shrink-0 bg-zinc-50 rounded-lg overflow-hidden">
              {product?.image && (
                <Image src={product.image} alt={product.name} fill className="object-contain" />
              )}
            </div>

            <div className="flex flex-col flex-1">
              <h3 className="font-medium text-sm line-clamp-2">{product?.name}</h3>

              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{product?.shortDescription}</p>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">${product?.price}</div>
                  {product?.oldPrice && (
                    <div className="text-xs text-muted-foreground line-through">${product.oldPrice}</div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">{product?.rating}</div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <div>{product?.shipping || "Free shipping"}</div>
                <div className="text-rose-600 font-medium">{product?.sold && `${product.sold} sold`}</div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// ProductQuickViewModalSkeleton.js


export function ProductQuickViewModalSkeleton({ product, open, onOpenChange, onAddToCart, onViewFullDetails }) {
  const [selectedVariant, setSelectedVariant] = useState(null);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full p-0 rounded-2xl">
        <div className="flex flex-col md:flex-row bg-white">
          {/* Left column: gallery */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full md:w-1/2 p-4 md:p-6"
          >
            <div className="flex gap-4">
              {/* thumbnails column */}
              <div className="hidden sm:flex flex-col gap-3 w-20">
                {(product?.gallery || []).slice(0, 5).map((src, i) => (
                  <div key={i} className="w-16 h-16 rounded-md overflow-hidden border bg-zinc-50">
                    <Image src={src} alt={`thumb-${i}`} width={64} height={64} className="object-cover" />
                  </div>
                ))}
              </div>

              {/* main image */}
              <div className="flex-1 rounded-md overflow-hidden bg-zinc-50 h-72 md:h-96">
                {product.image && (
                  <Image src={product.image} alt={product.name} fill className="object-contain" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Right column: details */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full md:w-1/2 p-6 flex flex-col"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{product.name}</DialogTitle>
            </DialogHeader>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">${product.price}</div>
                {product.oldPrice && <div className="text-sm text-muted-foreground line-through">${product.oldPrice}</div>}
              </div>

              <div className="text-sm text-muted-foreground">{product.condition || "New"}</div>
            </div>

            <Separator className="my-4" />

            <div className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {product.shortDescription || "Short product description goes here. Keep it concise for quick view."}
            </div>

            {/* variants placeholder */}
            {product?.variants?.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Options</div>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v, i) => (
                    <Button key={i} variant={selectedVariant === v ? "default" : "outline"} size="sm" onClick={() => setSelectedVariant(v)}>
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-3">
              <Button onClick={() => onAddToCart?.(product)}>Add to Cart</Button>
              <Button variant="outline" onClick={() => onViewFullDetails?.()}>View Full Details</Button>
            </div>

            <DialogFooter />
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
