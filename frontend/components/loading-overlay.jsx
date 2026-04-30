"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn helper for merging classNames

export default function LoadingOverlay({ show = false, text = "Loading..." }) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs"
      )}
    >
      <div className="flex flex-col items-center space-y-3 text-center text-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium">{text}</p>
      </div>
    </div>
  );
}
