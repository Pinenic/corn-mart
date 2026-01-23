"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Page() {
  useEffect(() => {
    document.title = 'Order Successful | Corn Mart';
  }, []);
  return (
    <div className="flex justify-center border h-[90vh] my-auto ">
      <div className="flex flex-col gap-8 my-auto">
        <h1 className="mx-auto text-2xl md:text-4xl">Thank you for using Corn Mart</h1>
        <motion.div
          layout
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex flex-col gap-8"
        >
          <h1 className="mx-auto text md:text-lg">Your order has been placed successfully</h1>
          <CheckCircle2 className="w-16 h-16 mx-auto text-text bg-primary rounded-full p-2" />
          <div className="flex justify-evenly">
            <Link
              href="/myorders"
              className="text-text text-sm font-medium hover:underline"
            >
              View your Orders
            </Link>
            <Link
              href="/shopping"
              className="text-primary text-sm font-medium hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
