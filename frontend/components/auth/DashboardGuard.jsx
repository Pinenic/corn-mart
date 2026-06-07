"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/lib/store/useAuthStore";
import { Spinner } from "@/components/ui";

export default function DashboardGuard({ children }) {
  const { user, loading, initialized, storeId } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized || loading) return;

    if (!user) {
      router.replace("/sign-in");
    } else if (!storeId) {
      router.replace("/onboarding");
    }
  }, [user, loading, initialized, storeId, router]);

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={32} className="text-blue-500" />
      </div>
    );
  }

  if (!user || !storeId) {
    return null;
  }

  return <>{children}</>;
}
