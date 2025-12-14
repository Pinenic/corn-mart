"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
        <Spinner className="size-8 text-blue-500"/>
      </div>
    );
  }

  return <>{user ? children : null}</>;
}
