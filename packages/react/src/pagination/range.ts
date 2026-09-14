export type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

/** Which pages to show: boundaries at both ends, siblings around the current page, ellipses for the rest. */
export function paginationRange(page: number, count: number, siblings: number, boundaries: number): PaginationItem[] {
  const span = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  const total = boundaries * 2 + siblings * 2 + 3;
  if (count <= total) return span(1, count);
  const start = span(1, boundaries);
  const end = span(count - boundaries + 1, count);
  const siblingStart = Math.max(Math.min(page - siblings, count - boundaries - siblings * 2 - 1), boundaries + 2);
  const siblingEnd = Math.min(Math.max(page + siblings, boundaries + siblings * 2 + 2), count - boundaries - 1);
  return [
    ...start,
    ...(siblingStart > boundaries + 2 ? (['start-ellipsis'] as PaginationItem[]) : span(boundaries + 1, boundaries + 1)),
    ...span(siblingStart, siblingEnd),
    ...(siblingEnd < count - boundaries - 1 ? (['end-ellipsis'] as PaginationItem[]) : span(count - boundaries, count - boundaries)),
    ...end,
  ];
}
