"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import AuthGuard from "@/components/auth/AuthGuard";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import CallToAction from "@/components/landing/CallToAction";
import useNotifications from "@/hooks/useNotifications";

export default function Home() {
  const { user, signOut } = useAuthStore();
  useNotifications(user.id);

  return (
      <div className="text-center">
        <Hero />
        <HowItWorks />
        <FeaturedProducts />
        <CallToAction />
        {/* <section className="py-16 text-center">
          <h2 className="text-2xl font-semibold text-leaf-600">
            Featured Products Coming Soon 🍍
          </h2>
        </section>
        <h1 className="text-2xl font-bold text-leafGreen-700">Dashboard</h1>
        <p className="text-gray-700 mt-2">Welcome, {user?.email}!</p>
        <button
          onClick={signOut}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Log Out
        </button> */}
      </div>
  );
}
