"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({ open, onClose, title, children, size = "md", className }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl", full: "max-w-full mx-4" };
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white w-full rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden", sizes[size], className)}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]"><X size={16} /></button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, side = "right", className }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  const sides = {
    right: "right-0 top-0 bottom-0 w-full max-w-[420px]",
    left:  "left-0 top-0 bottom-0 w-full max-w-[420px]",
  };
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("absolute bg-white shadow-2xl flex flex-col", sides[side], className)}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]"><X size={16} /></button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
