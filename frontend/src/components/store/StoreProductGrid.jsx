"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import ProductQuickViewModal from "../products/ProductQuickVeiwModal";
import { formatNumber } from "@/utils/numberFormatter";

export function ProductGrid({ products }) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleAddToCart = (product) => {
    // your cart logic here
    console.log("Add to cart:", product);
    setOpen(false);
  };

  return (
    <>
    <AnimatePresence>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl bg-background mx-auto p-4">
        {products?.map((p, i) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <div
              className="group relative bg-muted border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              onClick={() => handleQuickView(p)}
            >
              {/* Product Image */}
              <div className="relative w-full h-48 overflow-hidden">
                <motion.img
                  src={p.thumbnail_url}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Floating Cart Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute bottom-3 right-3 bg-primary text-white rounded-full p-2 shadow-md hidden sm:flex items-center justify-center hover:cursor-pointer group-hover:opacity-100"
                >
                  <ShoppingCart className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="text-sm font-medium">{p.name}</h3>
                <p className="text-primary font-semibold mt-1">K{formatNumber(p.price)}</p>
              </div>

              {/* Mobile Add to Cart */}
              <button className="sm:hidden absolute bottom-2 right-2 bg-primary text-white rounded-full p-2 shadow-md active:scale-95">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
      <ProductQuickViewModal
        open={open}
        onOpenChange={setOpen}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
