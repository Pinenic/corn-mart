"use client";
// lib/stores/toastStore.js
// Lightweight toast notification queue.
// Any part of the app (hooks, components, error handlers) can call
// toast.success() / toast.error() / toast.info() without prop drilling.

import { create } from "zustand";

let nextId = 1;

const DEFAULTS = {
  success: { duration: 4000 },
  error:   { duration: 6000 },  // errors stay visible longer
  warning: { duration: 5000 },
  info:    { duration: 4000 },
};

const useToastStore = create((set, get) => ({
  toasts: [],

  _add(type, message, options = {}) {
    const id       = nextId++;
    const duration = options.duration ?? DEFAULTS[type]?.duration ?? 4000;

    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration, ...options }],
    }));

    // Auto-dismiss
    setTimeout(() => get().dismiss(id), duration);
    return id;
  },

  success: (message, opts) => useToastStore.getState()._add("success", message, opts),
  error:   (message, opts) => useToastStore.getState()._add("error",   message, opts),
  warning: (message, opts) => useToastStore.getState()._add("warning", message, opts),
  info:    (message, opts) => useToastStore.getState()._add("info",    message, opts),

  dismiss(id) {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  dismissAll() {
    set({ toasts: [] });
  },
}));

// Convenience singleton so callers don't need to call a hook
// (useful inside non-component code like hooks/mutations)
export const toast = {
  success: (msg, opts) => useToastStore.getState().success(msg, opts),
  error:   (msg, opts) => useToastStore.getState().error(msg, opts),
  warning: (msg, opts) => useToastStore.getState().warning(msg, opts),
  info:    (msg, opts) => useToastStore.getState().info(msg, opts),
};

export default useToastStore;
