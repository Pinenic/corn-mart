import { create } from "zustand";

export const usePendingMessageRef = create((set) => ({
  messageRef: null,

  setMessageRef: (ref) => set({ messageRef: ref }),

  clear: () => set({ messageRef: null }),
}));
