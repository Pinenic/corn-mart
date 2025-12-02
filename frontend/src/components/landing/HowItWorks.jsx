"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Store, CreditCard } from "lucide-react";

const steps = [
  {
    icon: <Store className="w-10 h-10 text-primary" />,
    title: "Open Your Store",
    desc: "Sign up as a seller and create your own store page in minutes.",
  },
  {
    icon: <ShoppingBag className="w-10 h-10 text-primary" />,
    title: "List & Sell Products",
    desc: "Upload products, set prices, and reach buyers easily through Corn Mart.",
  },
  {
    icon: <CreditCard className="w-10 h-10 text-primary" />,
    title: "Get Paid Securely",
    desc: "Receive instant payments and manage your earnings through your dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-gradient-to-b from-white to-blue-50 dark:from-muted dark:to-background py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-extrabold mb-4"
        >
          How It Works
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-2xl mx-auto mb-12"
        >
          Whether you’re a buyer or a seller, Corn Mart makes online commerce
          simple, secure, and fun!
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-muted p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-blue-100 p-4 rounded-full">{step.icon}</div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
