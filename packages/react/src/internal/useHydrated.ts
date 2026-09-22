import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true from the next client render
 * on. For output that exists only on the client (a portal into an element the
 * component creates): gate it on this so the first client render matches the
 * server's, instead of `typeof document`, which differs between the two.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
