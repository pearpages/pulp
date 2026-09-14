import {
  Button as AriaButton,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarGridBody as AriaCalendarGridBody,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  Heading as AriaHeading,
} from 'react-aria-components';
import { ChevronLeft, ChevronRight } from '@pearpages/pulp-icons';
import { Icon } from '../icon';
import styles from './Calendar.module.css';

/**
 * The month view shared by Calendar and DatePicker: navigation, the visible
 * month name, weekday header and the day grid. It reads its state from the
 * vendor's calendar context, so it works inside either root. The vendor
 * names the grid for assistive technology through a visually hidden `h2`;
 * the visible month name is decorative (`aria-hidden`), which is why it is
 * a plain div and not a heading level of pulp's choosing.
 */
export function CalendarGrid() {
  return (
    <>
      <div className={styles.header}>
        <AriaButton slot="previous" className={styles.nav}>
          <Icon size="inherit">
            <ChevronLeft />
          </Icon>
        </AriaButton>
        <AriaHeading className={styles.heading} />
        <AriaButton slot="next" className={styles.nav}>
          <Icon size="inherit">
            <ChevronRight />
          </Icon>
        </AriaButton>
      </div>
      <AriaCalendarGrid className={styles.grid} weekdayStyle="short">
        <AriaCalendarGridHeader>{(day) => <AriaCalendarHeaderCell className={styles.weekday}>{day}</AriaCalendarHeaderCell>}</AriaCalendarGridHeader>
        <AriaCalendarGridBody>{(date) => <AriaCalendarCell date={date} className={styles.cell} />}</AriaCalendarGridBody>
      </AriaCalendarGrid>
    </>
  );
}

/** The root class, for DatePicker to style the vendor calendar inside its popover. */
export const calendarRootClass = styles.root;
