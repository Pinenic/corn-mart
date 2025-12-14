"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return null;
  return <>{!user && children}</>;
}
