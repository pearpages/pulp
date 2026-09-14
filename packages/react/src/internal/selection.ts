import type { Key, Selection } from 'react-aria-components';

/**
 * React Aria reports a selection as a Set of keys or the literal `'all'`
 * (Ctrl/Cmd+A in a multiple-selection collection). pulp's contract is a
 * plain array of ids, so `'all'` is resolved against the ids the caller knows.
 */
export function selectionToIds(selection: Selection, all: () => Iterable<Key>): string[] {
  const keys = selection === 'all' ? all() : selection;
  return Array.from(keys, String);
}
