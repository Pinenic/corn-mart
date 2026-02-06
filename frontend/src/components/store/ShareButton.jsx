"use client";

import { useState } from "react";
import { Share2, Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function ShareButton({ url }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Copied!");

    setTimeout(() => setCopied(false), 4000);
    setOpen(false);
  };

  const handleWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
    window.open(waUrl, "_blank");
    setOpen(false);
  };

  return (
    <div className="relative inline-block">

      {/* Trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center text-xs gap-2 px-4 py-2 rounded-xl border hover:bg-muted"
      >
        <Share2 size={14} />
        Share
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-background shadow-lg z-50">

          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-left"
          >
            <Copy size={16} />
            {copied ? "Copied!" : "Copy link"}
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-left"
          >
            <MessageCircle size={16} />
            WhatsApp
          </button>

        </div>
      )}
    </div>
  );
}
