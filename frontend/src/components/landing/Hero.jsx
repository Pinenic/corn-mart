"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 dark:from-background dark:to-muted to-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center px-6 md:px-12 gap-10">
        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-dark leading-tight">
            Shop Smart, Shop <span className="text-primary">Green</span> 🌿
          </h1>

          <p className="mt-4 text-gray-600 text-lg md:text-xl max-w-md mx-auto md:mx-0">
            Discover amazing products from trusted sellers — locally and globally — all in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button asChild className="bg-primary hover:bg-primary/80 text-white text-base px-6 py-3 rounded-full shadow-md">
              <Link href="/shopping">Start Shopping</Link>
            </Button>

            <Button asChild variant="outline" className="border-corn-400 text-corn-600 hover:bg-corn-50 text-base px-6 py-3 rounded-full">
              <Link href="/stores">Explore Stores</Link>
            </Button>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="flex-1"
        >
          <Image
            src="/images/hero-illustration.png"
            alt="Shopping illustration"
            width={550}
            height={450}
            className="object-contain drop-shadow-lg"
            priority
          />
        </motion.div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-corn-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-[80%] right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-40" />
    </section>
  );
}
