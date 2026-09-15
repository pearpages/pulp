import type { ReactNode, Ref } from 'react';
import {
  Button as AriaButton,
  Calendar as AriaCalendar,
  DateInput as AriaDateInput,
  DatePicker as AriaDatePicker,
  DateSegment as AriaDateSegment,
  Dialog as AriaDialog,
  Group as AriaGroup,
  I18nProvider,
  Popover as AriaPopover,
} from 'react-aria-components';
import { Calendar as CalendarIcon } from '@pearpages/pulp-icons';
import { CalendarGrid, calendarRootClass } from '../calendar/CalendarGrid';
import { Icon } from '../icon';
import { AriaFieldDescription, AriaFieldError, AriaFieldLabel, ariaFieldClass, isPresent } from '../internal/AriaField';
import { fromDate, toDate } from '../internal/dates';
import styles from './DatePicker.module.css';

export type DatePickerSize = 'sm' | 'md' | 'lg';

export interface DatePickerProps {
  /** Visible label. Always rendered. */
  label: ReactNode;
  description?: ReactNode;
  /** Presence marks the control invalid and announces the message. */
  error?: ReactNode;
  /** The date as `YYYY-MM-DD` (controlled). `null` is "none". */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Earliest selectable date, `YYYY-MM-DD`. */
  min?: string;
  /** Latest selectable date, `YYYY-MM-DD`. */
  max?: string;
  /** Marks single dates as unavailable in the calendar. */
  isDateUnavailable?: (date: string) => boolean;
  /** BCP 47 tag. Segment order, month names and the first weekday follow it; defaults to the browser's. */
  locale?: string;
  /** @default 'md' */
  size?: DatePickerSize;
  /** @default false */
  required?: boolean;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  readOnly?: boolean;
  /** Submitted with a form as `YYYY-MM-DD` through a hidden input. */
  name?: string;
  autoFocus?: boolean;
  /** Applied to the field wrapper. */
  className?: string;
  /** The wrapper element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * A date field with a calendar popover, on React Aria's date picker
 * (decision record 001): the date is typed segment by segment in the
 * user's locale order (arrows and digits, no free text to parse), and the
 * button opens the same month grid as Calendar. Dates cross the API as
 * ISO strings.
 *
 * @status experimental
 * @category Forms
 * @accessibility A `group` named by the label holding one `spinbutton` per date segment (day, month, year in the locale's order), a button that opens a `dialog` containing the Calendar grid, and a hidden input for forms. Arrows step a segment, digits type it, Escape closes the dialog and returns focus.
 * @do Pass `locale` when the app's language is not the browser's.
 * Use `min`/`max` for ranges the user cannot choose outside of.
 * @dont Parse the value yourself; it is always `YYYY-MM-DD`.
 * Use it for a date of birth decades away; the segments are faster than the calendar.
 */
export function DatePicker({
  label,
  description,
  error,
  value,
  defaultValue,
  onChange,
  min,
  max,
  isDateUnavailable,
  locale,
  size = 'md',
  required = false,
  disabled = false,
  readOnly = false,
  name,
  autoFocus,
  className,
  ref,
}: DatePickerProps) {
  const invalid = isPresent(error);
  const picker = (
    <AriaDatePicker
      ref={ref}
      className={ariaFieldClass(styles.root, className)}
      data-size={size}
      value={toDate(value)}
      defaultValue={toDate(defaultValue)}
      onChange={(date) => onChange?.(fromDate(date))}
      minValue={toDate(min) ?? undefined}
      maxValue={toDate(max) ?? undefined}
      isDateUnavailable={isDateUnavailable && ((date) => isDateUnavailable(fromDate(date) ?? ''))}
      isRequired={required}
      isDisabled={disabled}
      isReadOnly={readOnly}
      isInvalid={invalid}
      name={name}
      autoFocus={autoFocus}
      granularity="day"
    >
      <AriaFieldLabel required={required}>{label}</AriaFieldLabel>
      <AriaGroup className={styles.control}>
        <AriaDateInput className={styles.input}>{(segment) => <AriaDateSegment segment={segment} className={styles.segment} />}</AriaDateInput>
        <AriaButton className={styles.button}>
          <Icon size="inherit">
            <CalendarIcon />
          </Icon>
        </AriaButton>
      </AriaGroup>
      <AriaFieldDescription>{description}</AriaFieldDescription>
      <AriaFieldError>{error}</AriaFieldError>
      <AriaPopover className={styles.popover} placement="bottom start">
        <AriaDialog className={styles.dialog}>
          <AriaCalendar className={calendarRootClass}>
            <CalendarGrid />
          </AriaCalendar>
        </AriaDialog>
      </AriaPopover>
    </AriaDatePicker>
  );
  return locale ? <I18nProvider locale={locale}>{picker}</I18nProvider> : picker;
}

DatePicker.displayName = 'DatePicker';
