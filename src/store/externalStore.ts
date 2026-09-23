import { useSyncExternalStore } from 'react';

/**
 * A minimal store for module-level UI state, read from React through
 * `useSyncExternalStore` (concurrency-safe, no tearing) and writable from
 * anywhere. The setter accepts a value or an updater, and a write that leaves
 * the value identical (`Object.is`) notifies nobody — the same contract the
 * previous signal-based store had.
 */
export interface ExternalStore<T> {
  get: () => T;
  set: (next: T | ((previous: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createExternalStore<T>(initial: T): ExternalStore<T> {
  let value = initial;
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    set: (next) => {
      const resolved = typeof next === 'function' ? (next as (previous: T) => T)(value) : next;

      if (Object.is(resolved, value)) return;

      value = resolved;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Re-renders the component whenever the store changes. */
export function useExternalStoreValue<T>(store: ExternalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
