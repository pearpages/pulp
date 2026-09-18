import { useId, useState, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
import { Close } from '@pearpages/pulp-icons';
import { classes } from '../internal/classes';
import styles from './Chip.module.css';

export type ChipSize = 'sm' | 'md' | 'lg';
export type ChipTone = 'neutral' | 'action';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Controlled pressed state. Passing it (or `defaultSelected`, or `onSelectedChange`) makes the chip a toggle. */
  selected?: boolean;
  /** Uncontrolled initial pressed state. */
  defaultSelected?: boolean;
  /** Called with the next state when the chip is pressed. */
  onSelectedChange?: (selected: boolean) => void;
  /** Adds a remove button after the label: a second button beside the chip, never inside it. */
  onRemove?: () => void;
  /** The remove button is named "`removeLabel` + the chip's label" ("Remove Vegan"). @default 'Remove' */
  removeLabel?: string;
  /** `sm` is 24px high, the minimum target size. @default 'md' */
  size?: ChipSize;
  /** `action` takes the brand's colour; a selected chip is filled in either tone. @default 'neutral' */
  tone?: ChipTone;

  /** The `button` that carries the label, or the `span` when the chip neither toggles nor has an `onClick`. */
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

/**
 * A small pill for a choice or a value the user controls: a filter that
 * toggles (`selected`), a tag that can be removed (`onRemove`), or both. The
 * label is a button only when pressing it does something.
 *
 * @status experimental
 * @category Actions
 * @accessibility A toggle chip is a native `button` with `aria-pressed`, so Space and Enter work and the state is announced. The remove control is a second `button`, a sibling of the first (a button inside a button is invalid HTML and unreachable by keyboard), named by `removeLabel` plus the chip's own label through `aria-labelledby`: "Remove Vegan", not "Remove" six times. The pair is wrapped in a `role="group"` named by the label only when there are two controls. `disabled` disables both. After removing a chip, move focus yourself (to the next chip or the input): the button that had it is gone.
 * @do Use a group of toggle chips for filters where several can be on at once.
 * @do Keep the label to a word or two; a chip does not wrap.
 * @dont Use a chip that does nothing as a label or a status: that is a Badge.
 * @dont Use chips for one choice out of several; that is a SegmentedControl or a RadioGroup.
 */
export function Chip({
  selected,
  defaultSelected,
  onSelectedChange,
  onRemove,
  removeLabel = 'Remove',
  size = 'md',
  tone = 'neutral',
  disabled,
  className,
  onClick,
  ref,
  children,
  ...rest
}: ChipProps) {
  const id = useId();
  const [own, setOwn] = useState(defaultSelected ?? false);
  const toggles = selected !== undefined || defaultSelected !== undefined || onSelectedChange !== undefined;
  const pressed = selected ?? own;
  const interactive = toggles || onClick !== undefined;

  const label = interactive ? (
    <button
      type="button"
      {...rest}
      ref={ref}
      id={`${id}-label`}
      className={styles.label}
      disabled={disabled}
      aria-pressed={toggles ? pressed : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !toggles) return;
        if (selected === undefined) setOwn(!pressed);
        onSelectedChange?.(!pressed);
      }}
    >
      {children}
    </button>
  ) : (
    <span id={`${id}-label`} className={styles.label} ref={ref as Ref<HTMLSpanElement>}>
      {children}
    </span>
  );

  return (
    <span
      className={classes(styles.root, className)}
      data-size={size}
      data-tone={tone}
      data-selected={toggles && pressed ? '' : undefined}
      data-interactive={interactive ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      role={interactive && onRemove ? 'group' : undefined}
      aria-labelledby={interactive && onRemove ? `${id}-label` : undefined}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          id={`${id}-remove`}
          className={styles.remove}
          disabled={disabled}
          aria-label={removeLabel}
          aria-labelledby={`${id}-remove ${id}-label`}
          onClick={onRemove}
        >
          <Close aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

Chip.displayName = 'Chip';
