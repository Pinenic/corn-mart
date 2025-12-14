// lib/useNotificationStore.js
import { create } from "zustand";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  addNotification: (note) =>
    set((state) => ({
      notifications: [note, ...state.notifications],
    })),
}));
