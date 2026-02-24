import { create } from "zustand";

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (list) =>
    set({
      notifications: list,
      unreadCount: list.filter(n => !n.viewed).length,
    }),

  addNotification: (notification) =>
    set((state) => {
      const exists = state.notifications.some(
        n => n.id === notification.id
      );
      if (exists) return state;

      const updated = [notification, ...state.notifications];

      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.viewed).length,
      };
    }),

  updateNotification: (updated) =>
    set((state) => {
      const updatedList = state.notifications.map(n =>
        n.id === updated.id ? updated : n
      );

      return {
        notifications: updatedList,
        unreadCount: updatedList.filter(n => !n.viewed).length,
      };
    }),

  markAllViewed: () =>
    set((state) => ({
      notifications: state.notifications.map(n => ({
        ...n,
        viewed: true,
      })),
      unreadCount: 0,
    })),
}));