import { useId, useState, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { renderAsChild } from '../internal/asChild';
import { classes } from '../internal/classes';
import styles from './SegmentedControl.module.css';

export type SegmentedControlSize = 'sm' | 'md';
export type SegmentedControlLook = 'segmented' | 'chips';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: ReactNode;
  /** Decorative: hidden from assistive technology, so the label must stand on its own. */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'> {
  /** Names the group for assistive technology. Not rendered; label it visibly with `aria-labelledby` instead when there is a heading. */
  label?: string;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  /** Controlled selected value. */
  value?: T;
  /** Initially selected value when uncontrolled. */
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  /** Form field name shared by the radios. Generated when omitted. */
  name?: string;
  /** `segmented` is one track with a raised thumb; `chips` is separate pills that wrap. @default 'segmented' */
  look?: SegmentedControlLook;
  /** @default 'md' */
  size?: SegmentedControlSize;
  /** Segments share the container's width equally. `segmented` look only. @default false */
  fullWidth?: boolean;
  disabled?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/**
 * One choice out of a few, all visible, switching what is shown in place: a
 * view mode, a unit, a sort order. Generic over a string union, so `value`
 * and `onValueChange` are typed by the options. For links that navigate to
 * another page use `SegmentedControl.Nav`, which looks the same and is a `nav`.
 *
 * @status experimental
 * @category Forms
 * @accessibility A `radiogroup` of native radio inputs, exactly as RadioGroup: the keyboard is the browser's own (arrows move and select, Tab enters on the checked radio and leaves the group), nothing is re-implemented. Name the group with `label` or `aria-labelledby`. The inputs are visually hidden, not removed, so the focus ring is drawn on the visible segment and the control takes part in a form (`name`). Icons are decorative.
 * @do Use it for two to five short options that change the view in place.
 * @do Use `SegmentedControl.Nav` when each option is a URL.
 * @dont Use it for on/off; that is a Switch. For several at once, toggle Chips.
 * @dont Use it for a form question with longer labels or a description; that is a RadioGroup.
 */
export function SegmentedControl<T extends string = string>({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  look = 'segmented',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  ref,
  ...rest
}: SegmentedControlProps<T>) {
  const generated = useId();
  const [own, setOwn] = useState<T | undefined>(defaultValue);
  const selected = value ?? own;

  return (
    <div
      {...rest}
      ref={ref}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={classes(styles.root, className)}
      data-look={look}
      data-size={size}
      data-full-width={fullWidth ? '' : undefined}
    >
      {options.map((option) => (
        <label key={option.value} className={styles.option} data-selected={option.value === selected ? '' : undefined}>
          <input
            type="radio"
            className={styles.input}
            name={name ?? generated}
            value={option.value}
            checked={option.value === selected}
            disabled={disabled || option.disabled}
            onChange={() => {
              if (value === undefined) setOwn(option.value);
              onValueChange?.(option.value);
            }}
          />
          <span className={styles.segment}>
            {option.icon != null && (
              <span className={styles.icon} aria-hidden="true">
                {option.icon}
              </span>
            )}
            <span className={styles.label}>{option.label}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

export interface SegmentedControlNavProps extends HTMLAttributes<HTMLElement> {
  /** Names the landmark ("Feed view"). Required: a page with several `nav`s needs them told apart. */
  label: string;
  /** @default 'segmented' */
  look?: SegmentedControlLook;
  /** @default 'md' */
  size?: SegmentedControlSize;
  /** @default false */
  fullWidth?: boolean;
  ref?: Ref<HTMLElement>;
  /** `SegmentedControl.NavItem`s. */
  children: ReactNode;
}

/**
 * The same look for links that navigate: a labelled `nav` with a list of
 * links, the current one marked `aria-current="page"`. Not a radiogroup and
 * not tabs: following a link loads another page, and a screen reader user
 * should be told so.
 */
function SegmentedControlNav({ label, look = 'segmented', size = 'md', fullWidth = false, className, ref, children, ...rest }: SegmentedControlNavProps) {
  return (
    <nav {...rest} ref={ref} aria-label={label} className={classes(styles.root, className)} data-look={look} data-size={size} data-full-width={fullWidth ? '' : undefined}>
      <ul role="list" className={styles.list}>
        {children}
      </ul>
    </nav>
  );
}

export interface SegmentedControlNavItemProps<E extends HTMLElement = HTMLAnchorElement> extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** This link is the page being shown: `aria-current="page"` and the selected look. @default false */
  current?: boolean;
  /** Render the single child instead of an `a`: a router's link component. @default false */
  asChild?: boolean;
  ref?: Ref<E>;
  children: ReactNode;
}

/** One link of a `SegmentedControl.Nav`. With `asChild`, the router's own link takes the styles. */
function SegmentedControlNavItem<E extends HTMLElement = HTMLAnchorElement>({ current = false, asChild = false, className, ref, children, ...rest }: SegmentedControlNavItemProps<E>) {
  const segment = classes(styles.segment, className);
  const ariaCurrent = current ? ('page' as const) : undefined;
  return (
    <li className={styles.option} data-selected={current ? '' : undefined}>
      {asChild ? (
        // eslint-disable-next-line react-hooks/refs -- forwarded, not read
        renderAsChild('SegmentedControl.NavItem', children, { ...rest, ref, className: segment, 'aria-current': ariaCurrent })
      ) : (
        <a {...rest} ref={ref as Ref<HTMLAnchorElement>} className={segment} aria-current={ariaCurrent}>
          <span className={styles.label}>{children}</span>
        </a>
      )}
    </li>
  );
}

SegmentedControl.displayName = 'SegmentedControl';
SegmentedControlNav.displayName = 'SegmentedControl.Nav';
SegmentedControlNavItem.displayName = 'SegmentedControl.NavItem';

SegmentedControl.Nav = SegmentedControlNav;
SegmentedControl.NavItem = SegmentedControlNavItem;
