import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { ChevronDown } from '@pearpages/pulp-icons';
import { Icon } from '../icon';
import { classes } from '../internal/classes';
import { useRovingFocus } from '../internal/useRovingFocus';
import styles from './Accordion.module.css';

export type AccordionType = 'single' | 'multiple';
export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

interface AccordionContextValue {
  openValues: ReadonlySet<string>;
  toggle: (value: string) => void;
  headingLevel: AccordionHeadingLevel;
  baseId: string;
}

interface ItemContextValue {
  value: string;
  open: boolean;
  disabled: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);

function useAccordion(part: string): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) throw new Error(`${part} must be rendered inside <Accordion>`);
  return context;
}

function useItem(part: string): ItemContextValue {
  const context = useContext(ItemContext);
  if (!context) throw new Error(`${part} must be rendered inside <Accordion.Item>`);
  return context;
}

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** `single` keeps one item open; `multiple` allows any number. @default 'single' */
  type?: AccordionType;
  /** Controlled open item(s): a string for `single`, an array for `multiple`. */
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  /** In `single` mode, whether the open item can be closed again. @default true */
  collapsible?: boolean;
  /** The heading level of every trigger, for the document outline. @default 3 */
  headingLevel?: AccordionHeadingLevel;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

const toSet = (value: string | string[] | undefined): Set<string> =>
  new Set(value === undefined ? [] : Array.isArray(value) ? value : [value]);

/**
 * Vertically stacked sections that expand one at a time or independently.
 * Each trigger is a button inside a real heading, each panel a labelled
 * region; arrows, Home and End move between triggers. Controlled or
 * uncontrolled by `value`. Compose with `Accordion.Item`,
 * `Accordion.Trigger` and `Accordion.Panel`.
 *
 * @status stable
 * @accessibility Each trigger is a `button` inside a heading of the given `headingLevel`; each panel is a `region` labelled by its trigger. Arrows, Home and End move between triggers; Enter or Space toggles.
 * @do Set `headingLevel` to fit the page outline.
 * Use `multiple` when sections are independent reference material.
 * @dont Nest interactive content in the trigger; it is one button.
 * Use it for a single show-more; use Popover or plain content instead.
 */
export function Accordion({
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  headingLevel = 3,
  className,
  onKeyDown,
  ref,
  children,
  ...rest
}: AccordionProps) {
  const [uncontrolled, setUncontrolled] = useState<Set<string>>(() => toSet(defaultValue));
  const controlled = value !== undefined;
  const openValues = controlled ? toSet(value) : uncontrolled;

  const toggle = useCallback(
    (item: string) => {
      const next = new Set(openValues);
      if (next.has(item)) {
        if (type === 'single' && !collapsible) return;
        next.delete(item);
      } else {
        if (type === 'single') next.clear();
        next.add(item);
      }
      if (!controlled) setUncontrolled(next);
      onValueChange?.(type === 'single' ? (next.values().next().value ?? '') : Array.from(next));
    },
    [openValues, type, collapsible, controlled, onValueChange],
  );

  const baseId = useId();
  const rove = useRovingFocus({ orientation: 'vertical', selector: '[data-accordion-trigger]' });

  return (
    <AccordionContext.Provider value={{ openValues, toggle, headingLevel, baseId }}>
      <div
        {...rest}
        ref={ref}
        className={classes(styles.accordion, className)}
        data-type={type}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) rove(event);
        }}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

function AccordionItem({ value, disabled = false, className, ref, children, ...rest }: AccordionItemProps) {
  const accordion = useAccordion('Accordion.Item');
  const open = accordion.openValues.has(value);
  return (
    <ItemContext.Provider value={{ value, open, disabled }}>
      <div
        {...rest}
        ref={ref}
        className={classes(styles.item, className)}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
}

interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

function AccordionTrigger({ className, onClick, ref, children, ...rest }: AccordionTriggerProps) {
  const accordion = useAccordion('Accordion.Trigger');
  const item = useItem('Accordion.Trigger');
  const triggerId = `${accordion.baseId}-${item.value}-trigger`;
  const panelId = `${accordion.baseId}-${item.value}-panel`;
  return createElement(
    `h${accordion.headingLevel}`,
    { className: styles.heading },
    <button
      {...rest}
      ref={ref}
      type="button"
      id={triggerId}
      aria-expanded={item.open}
      aria-controls={panelId}
      disabled={item.disabled}
      className={classes(styles.trigger, className)}
      data-accordion-trigger=""
      data-state={item.open ? 'open' : 'closed'}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) accordion.toggle(item.value);
      }}
    >
      <span className={styles.label}>{children}</span>
      <Icon size="inherit" className={styles.chevron}>
        <ChevronDown />
      </Icon>
    </button>,
  );
}

interface AccordionPanelProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

function AccordionPanel({ className, ref, children, ...rest }: AccordionPanelProps) {
  const accordion = useAccordion('Accordion.Panel');
  const item = useItem('Accordion.Panel');
  return (
    <div
      {...rest}
      ref={ref}
      id={`${accordion.baseId}-${item.value}-panel`}
      role="region"
      aria-labelledby={`${accordion.baseId}-${item.value}-trigger`}
      hidden={!item.open}
      className={classes(styles.panel, className)}
      data-state={item.open ? 'open' : 'closed'}
    >
      {children}
    </div>
  );
}

Accordion.displayName = 'Accordion';
AccordionItem.displayName = 'Accordion.Item';
AccordionTrigger.displayName = 'Accordion.Trigger';
AccordionPanel.displayName = 'Accordion.Panel';

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Panel = AccordionPanel;
