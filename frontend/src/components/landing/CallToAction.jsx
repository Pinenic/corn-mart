"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-blue-100 text-black py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-extrabold"
        >
          Ready to Start Your Journey with <span className="text-blue-600">Corn Mart</span>?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-blue-100 max-w-2xl mx-auto"
        >
          Join thousands of creators, sellers, and shoppers in a growing marketplace built
          for you. Whether you’re here to buy or to sell — we’ve got your back.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/auth/signup"
            className="bg-blue-400 text-blue-900 font-semibold px-8 py-3 rounded-full hover:bg-blue-300 transition-all shadow-lg hover:shadow-blue-200"
          >
            Create an Account
          </Link>

          <Link
            href="/stores"
            className="border border-blue-400 text-blue-300 px-8 py-3 rounded-full font-semibold hover:bg-blue-400 hover:text-blue-900 transition-all"
          >
            Explore Stores
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
