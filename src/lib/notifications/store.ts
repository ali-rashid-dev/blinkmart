"use client";

import { useSyncExternalStore, useEffect } from "react";
import type { AppNotification } from "./types";
import {
  getNotificationsAction,
  markReadAction,
  markAllReadAction,
  dismissNotificationAction,
} from "@/app/(app)/notification/actions";

export interface NotificationsState {
  loading: boolean;
  list: AppNotification[];
  error: string | null;
}

let currentState: NotificationsState = {
  loading: false,
  list: [],
  error: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(updater: (prev: NotificationsState) => NotificationsState) {
  currentState = updater(currentState);
  emitChange();
}

let isInitialLoading = false;

export const notificationsStore = {
  getSnapshot(): NotificationsState {
    return currentState;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  async load(force = false) {
    if (currentState.loading && !force) return;
    if (isInitialLoading && !force) return;

    isInitialLoading = true;
    // If forcing a load, clear the cached list so we don't show another user's data
    updateState((prev) => ({ ...prev, loading: true, error: null, list: force ? [] : prev.list }));

    try {
      const res = await getNotificationsAction();

      if (res.success) {
        updateState((prev) => ({
          ...prev,
          loading: false,
          list: res.data,
          error: null,
        }));
      } else {
        // If unauthorized, clear any cached list and report the auth error
        if (res.error.code === "UNAUTHORIZED") {
          updateState((prev) => ({ ...prev, loading: false, list: [], error: res.error.message }));
        } else {
          updateState((prev) => ({ ...prev, loading: false, error: res.error.message }));
        }
      }
    } catch (err: any) {
      // Network or unexpected error while loading — surface message and clear list on auth failure
      const message = err?.message ?? "Failed to load notifications";
      updateState((prev) => ({ ...prev, loading: false, error: message }));
    } finally {
      isInitialLoading = false;
    }
  },

  async markRead(id: string) {
    // Optimistic update
    updateState((prev) => ({
      ...prev,
      list: prev.list.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));

    const res = await markReadAction(id);
    if (!res.success) {
      // Revert if error
      void notificationsStore.load(true);
    }
  },

  async markAllRead() {
    // Optimistic update
    updateState((prev) => ({
      ...prev,
      list: prev.list.map((n) => ({ ...n, read: true })),
    }));

    const res = await markAllReadAction();
    if (!res.success) {
      void notificationsStore.load(true);
    }
  },

  async remove(id: string) {
    // Optimistic update
    updateState((prev) => ({
      ...prev,
      list: prev.list.filter((n) => n.id !== id),
    }));

    const res = await dismissNotificationAction(id);
    if (!res.success) {
      void notificationsStore.load(true);
    }
  },
  reset() {
    currentState = { loading: false, list: [], error: null };
    emitChange();
  },
};

export function useNotifications() {
  const state = useSyncExternalStore(
    notificationsStore.subscribe,
    notificationsStore.getSnapshot,
    notificationsStore.getSnapshot
  );

  useEffect(() => {
    void notificationsStore.load();
  }, []);

  const unread = state.list.filter((n) => !n.read).length;

  return {
    list: state.list,
    unread,
    loading: state.loading,
    error: state.error,
    refresh: () => void notificationsStore.load(true),
  };
}
