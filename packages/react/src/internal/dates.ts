import { parseDate, type CalendarDate, type DateValue } from '@internationalized/date';

/**
 * pulp's date contract is an ISO calendar date string (`YYYY-MM-DD`); the
 * vendor's date objects stay behind this boundary (decision record 001).
 * `undefined` stays `undefined` so uncontrolled props remain uncontrolled.
 */
export function toDate(iso: string | null | undefined): CalendarDate | null | undefined {
  if (iso === undefined) return undefined;
  if (iso === null || iso === '') return null;
  return parseDate(iso);
}

export function fromDate(date: DateValue | null): string | null {
  return date ? date.toString().slice(0, 10) : null;
}
