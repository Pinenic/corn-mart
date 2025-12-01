"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import Hero from "@/components/landing/Hero";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const { user, signOut } = useAuthStore();


  return (
    
    <AuthGuard>
      <div className="p-6 text-center">
            <Hero />
            <section className="py-16 text-center">
              <h2 className="text-2xl font-semibold text-leaf-600">
                Featured Products Coming Soon 🍍
              </h2>
            </section>
            <h1 className="text-2xl font-bold text-leafGreen-700">Dashboard</h1>
            <p className="text-gray-700 mt-2">Welcome, {user.email}!</p>
            <button
              onClick={signOut}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
    </AuthGuard>
  );
}
