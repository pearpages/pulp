import { useState, type Ref } from 'react';
import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';
import { Calendar as AriaCalendar, I18nProvider } from 'react-aria-components';
import { classes } from '../internal/classes';
import { fromDate, toDate } from '../internal/dates';
import { CalendarGrid, calendarRootClass } from './CalendarGrid';

export interface CalendarProps {
  /** Selected date as `YYYY-MM-DD` (controlled). `null` is "none". */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Earliest selectable date, `YYYY-MM-DD`. */
  min?: string;
  /** Latest selectable date, `YYYY-MM-DD`. */
  max?: string;
  /** Marks single dates as unavailable (shown, not selectable). */
  isDateUnavailable?: (date: string) => boolean;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  readOnly?: boolean;
  /** BCP 47 tag. Month names, weekday order and the first day of the week follow it; defaults to the browser's. */
  locale?: string;
  /** The grid's accessible name. @default 'Calendar' */
  'aria-label'?: string;
  id?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A month grid for choosing one date, on React Aria's calendar (decision
 * record 001): arrows move by day and week, Page Up/Down by month, Home and
 * End to the edges of the week, Enter or Space selects; every cell is
 * announced with its full date and the grid is named by a visually hidden
 * level-2 heading. Dates cross the API as ISO strings. For a date inside a
 * form, DatePicker wraps this in a field with a popover.
 *
 * @status experimental
 * @category Forms
 * @accessibility The grid is `role="grid"` named by a visually hidden level-2 heading ("Calendar, September 2026"); each day is a button announced with its full date, today and selection state. Arrows move by day and week, Page Up/Down by month, Home/End to the week edges, Enter or Space selects.
 * @do Pass `locale` when the app's language is not the browser's.
 * Mark unavailable dates with `isDateUnavailable` rather than removing them.
 * @dont Use it inside a form; use DatePicker, which adds the field and the popover.
 * Set `min` after `max`; the vendor disables the whole grid.
 */
export function Calendar({
  value,
  defaultValue,
  onChange,
  min,
  max,
  isDateUnavailable,
  disabled = false,
  readOnly = false,
  locale,
  'aria-label': ariaLabel = 'Calendar',
  className,
  ref,
  ...rest
}: CalendarProps) {
  // The visible month follows the user, and also jumps when `value` is
  // changed from outside (the vendor alone would keep showing the old month).
  const [focused, setFocused] = useState<CalendarDate>(() => toDate(value ?? defaultValue) ?? today(getLocalTimeZone()));
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    const next = toDate(value);
    if (next) setFocused(next);
  }
  const calendar = (
    <AriaCalendar
      {...rest}
      ref={ref}
      aria-label={ariaLabel}
      className={classes(calendarRootClass, className)}
      value={toDate(value)}
      defaultValue={toDate(defaultValue)}
      onChange={(date) => onChange?.(fromDate(date))}
      focusedValue={focused}
      onFocusChange={setFocused}
      minValue={toDate(min) ?? undefined}
      maxValue={toDate(max) ?? undefined}
      isDateUnavailable={isDateUnavailable && ((date) => isDateUnavailable(fromDate(date) ?? ''))}
      isDisabled={disabled}
      isReadOnly={readOnly}
    >
      <CalendarGrid />
    </AriaCalendar>
  );
  return locale ? <I18nProvider locale={locale}>{calendar}</I18nProvider> : calendar;
}

Calendar.displayName = 'Calendar';
