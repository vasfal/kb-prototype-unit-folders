import { useSyncExternalStore } from 'react';

let version = 0;
const listeners = new Set<() => void>();

export function notifyFoldersChanged() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return version;
}

/** Returns a number that increments on every folder mutation.
 *  Pass to useMemo deps to recompute folder-derived values. */
export function useFolderVersion(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
