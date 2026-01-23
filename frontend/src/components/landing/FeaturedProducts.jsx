"use client";

import { getAllProducts } from "@/lib/marketplaceApi";
import { formatNumber } from "@/utils/numberFormatter";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

// const products = [
//   {
//     id: 1,
//     name: "Handcrafted Wooden Bowl",
//     price: "K24.99",
//     image: "https://images.unsplash.com/photo-1606813902919-3d0139d3d93e?auto=format&fit=crop&w=800&q=60",
//   },
//   {
//     id: 2,
//     name: "Stylish Leather Wallet",
//     price: "K45.00",
//     image: "https://images.unsplash.com/photo-1618354691481-89b8f58b29b3?auto=format&fit=crop&w=800&q=60",
//   },
//   {
//     id: 3,
//     name: "Minimal Ceramic Mug",
//     price: "K12.50",
//     image: "https://images.unsplash.com/photo-1603791452906-c9a7a3d57b1b?auto=format&fit=crop&w=800&q=60",
//   },
//   {
//     id: 4,
//     name: "Eco Cotton Tote Bag",
//     price: "K18.99",
//     image: "https://images.unsplash.com/photo-1627374641533-1c1fd49c1d5f?auto=format&fit=crop&w=800&q=60",
//   },
// ];

export default function FeaturedProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
  
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await getAllProducts(0);
        setProducts(res.data.productsWithlocation.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("failed to fetch products", error);
      }
    }

    useEffect(() => {
        fetchProducts();
      }, []);
  return (
    <section className="bg-background py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-extrabold mb-4"
        >
          Featured Products
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 max-w-2xl mx-auto mb-12"
        >
          Explore some of the trending picks from our amazing community of sellers.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-muted rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="relative w-full h-56">
                <Image
                  src={product.thumbnail_url}
                  alt={product.name}
                  width={800}
                  height={60}
                  className="object-cover h-56 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-left">
                <h3 className="text-lg font-semibold text-blueMain-700 mb-1">
                  {product.name}
                </h3>
                <p className="text-primary">K{formatNumber(product.price)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
