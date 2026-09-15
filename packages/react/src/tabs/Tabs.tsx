import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { classes } from '../internal/classes';
import { useRovingFocus } from '../internal/useRovingFocus';
import styles from './Tabs.module.css';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivation = 'automatic' | 'manual';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: TabsOrientation;
  activation: TabsActivation;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`${component} must be rendered inside <Tabs>`);
  return context;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Controlled selected tab. */
  value?: string;
  /** Initially selected tab when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Layout and arrow-key axis. @default 'horizontal' */
  orientation?: TabsOrientation;
  /**
   * `automatic` selects a tab when it receives focus (arrow keys); `manual`
   * moves focus only and selects on Enter, Space or click.
   * @default 'automatic'
   */
  activation?: TabsActivation;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * Tabbed sections following the WAI-ARIA Tabs pattern. Compose with
 * `Tabs.List`, `Tabs.Tab` and `Tabs.Panel`; ids and ARIA relationships are
 * wired automatically. One tab stop: arrows move between tabs, Home and End
 * jump to the ends, disabled tabs are skipped. State on the DOM:
 * `data-orientation`, `data-state="active|inactive"`.
 *
 * @status stable
 * @accessibility The WAI-ARIA Tabs pattern: `tablist` with `aria-orientation`, `tab`s carrying `aria-selected` and `aria-controls`, `tabpanel`s labelled by their tab. One tab stop: arrows move (and select with automatic activation), Home/End jump, disabled tabs are skipped.
 * @do Use `activation="manual"` when switching a tab is expensive.
 * Name the `Tabs.List` with `aria-label`.
 * @dont Use tabs for sequential steps; use a stepper pattern.
 * Put a link inside a tab.
 */
export function Tabs({
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  activation = 'automatic',
  className,
  ref,
  children,
  ...rest
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
  const controlled = value !== undefined;
  const current = controlled ? value : uncontrolled;
  const setValue = useCallback(
    (next: string) => {
      if (!controlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );
  const baseId = useId();

  return (
    <TabsContext.Provider value={{ value: current, setValue, orientation, activation, baseId }}>
      <div {...rest} ref={ref} className={classes(styles.root, className)} data-orientation={orientation}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

function TabsList({ className, ref, onKeyDown, children, ...rest }: TabsListProps) {
  const { orientation, activation, setValue } = useTabs('Tabs.List');
  const rove = useRovingFocus({
    orientation,
    selector: '[role="tab"]',
    onFocusItem: (item) => {
      if (activation === 'automatic' && item.dataset.value !== undefined) setValue(item.dataset.value);
    },
  });
  return (
    <div
      {...rest}
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={classes(styles.list, className)}
      data-orientation={orientation}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) rove(event);
      }}
    >
      {children}
    </div>
  );
}

interface TabsTabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Identifies the tab; the panel with the same value belongs to it. */
  value: string;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

function TabsTab({ value, disabled, className, onClick, ref, children, ...rest }: TabsTabProps) {
  const tabs = useTabs('Tabs.Tab');
  const selected = tabs.value === value;
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="tab"
      id={`${tabs.baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${tabs.baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={classes(styles.tab, className)}
      data-value={value}
      data-state={selected ? 'active' : 'inactive'}
      data-disabled={disabled ? '' : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) tabs.setValue(value);
      }}
    >
      {children}
    </button>
  );
}

interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

function TabsPanel({ value, className, ref, children, ...rest }: TabsPanelProps) {
  const tabs = useTabs('Tabs.Panel');
  const selected = tabs.value === value;
  return (
    <div
      {...rest}
      ref={ref}
      role="tabpanel"
      id={`${tabs.baseId}-panel-${value}`}
      aria-labelledby={`${tabs.baseId}-tab-${value}`}
      hidden={!selected}
      tabIndex={0}
      className={classes(styles.panel, className)}
      data-state={selected ? 'active' : 'inactive'}
    >
      {children}
    </div>
  );
}

Tabs.displayName = 'Tabs';
TabsList.displayName = 'Tabs.List';
TabsTab.displayName = 'Tabs.Tab';
TabsPanel.displayName = 'Tabs.Panel';

Tabs.List = TabsList;
Tabs.Tab = TabsTab;
Tabs.Panel = TabsPanel;
