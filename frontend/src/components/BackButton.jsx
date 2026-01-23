"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({ label = "Back" }) {
  const router = useRouter();

  return (
    <div className="md:hidden mb-3">
      <Button
        variant="outline"
        className="flex items-center gap-2 p-0"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="text-base">{label}</span>
      </Button>
    </div>
  );
}
