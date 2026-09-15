import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icon';
import { renderAsChild } from '../internal/asChild';
import { classes } from '../internal/classes';
import { useFloatingPosition, type FloatingPlacement } from '../internal/floating';
import { useDismiss } from '../internal/useDismiss';
import { useRovingFocus } from '../internal/useRovingFocus';
import styles from './Menu.module.css';

export type MenuPlacement = FloatingPlacement;
type FocusTarget = 'first' | 'last' | null;

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean, focus?: FocusTarget) => void;
  focusTarget: FocusTarget;
  triggerId: string;
  contentId: string;
  floating: ReturnType<typeof useFloatingPosition>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu(part: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) throw new Error(`${part} must be rendered inside <Menu>`);
  return context;
}

export interface MenuProps {
  open?: boolean;
  /** @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @default 'bottom-start' */
  placement?: MenuPlacement;
  children: ReactNode;
}

/**
 * A list of actions opened from a button, following the WAI-ARIA menu
 * button pattern: Down/Up arrow on the trigger opens and focuses the first
 * or last item, arrows move with wraparound, Home and End jump, typing
 * jumps to the next item starting with that letter, Enter, Space or click
 * selects and closes, Escape and Tab close and return focus. Compose with
 * `Menu.Trigger`, `Menu.Content`, `Menu.Item` and `Menu.Separator`.
 *
 * @status stable
 * @category Overlays
 * @accessibility The WAI-ARIA menu button pattern: the trigger has `aria-haspopup="menu"` and `aria-expanded`; the popup is `role="menu"` named by the trigger with `menuitem` children. Down/Up opens to the first/last item, arrows wrap, Home/End jump, typing jumps, Enter/Space/click select and close, Escape and Tab close and return focus.
 * @do Use `tone="danger"` for destructive items and put them after a separator.
 * @dont Put form controls or links that navigate inside a menu; those want Popover or a navigation list.
 * Use it for navigation between pages.
 */
export function Menu({ open, defaultOpen = false, onOpenChange, placement = 'bottom-start', children }: MenuProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(null);
  const controlled = open !== undefined;
  const isOpen = controlled ? open : uncontrolled;
  const setOpen = useCallback(
    (next: boolean, focus: FocusTarget = null) => {
      setFocusTarget(next ? focus : null);
      if (!controlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );
  const id = useId();
  const floating = useFloatingPosition({ open: isOpen, placement });

  return (
    <MenuContext.Provider value={{ open: isOpen, setOpen, focusTarget, triggerId: `${id}-trigger`, contentId: `${id}-menu`, floating }}>
      {children}
    </MenuContext.Provider>
  );
}

function mergeRefs<T>(a: Ref<T> | undefined, b: (node: T | null) => void) {
  return (node: T | null) => {
    b(node);
    if (typeof a === 'function') a(node);
    else if (a) a.current = node;
  };
}

interface MenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

function MenuTrigger({ asChild = false, onClick, onKeyDown, ref, children, ...rest }: MenuTriggerProps) {
  const menu = useMenu('Menu.Trigger');
  const props = {
    ...rest,
    id: menu.triggerId,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': menu.open,
    'aria-controls': menu.open ? menu.contentId : undefined,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) menu.setOpen(!menu.open, 'first');
    },
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        menu.setOpen(true, event.key === 'ArrowDown' ? 'first' : 'last');
      }
    },
  };
  const setRef = mergeRefs(ref, menu.floating.refs.setReference);
  // eslint-disable-next-line react-hooks/refs -- forwarded to the reference element, not read
  if (asChild) return renderAsChild('Menu.Trigger', children, { ...props, ref: setRef });
  return (
    <button type="button" {...props} ref={setRef}>
      {children}
    </button>
  );
}

interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

function MenuContent({ className, onKeyDown, ref, children, ...rest }: MenuContentProps) {
  const menu = useMenu('Menu.Content');
  const { refs, positionStyle, placement } = menu.floating;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const rove = useRovingFocus({ orientation: 'vertical', selector: '[role="menuitem"]' });

  useDismiss({
    open: menu.open,
    onDismiss: () => menu.setOpen(false),
    inside: () => [refs.reference.current as Element | null, refs.floating.current],
  });

  useEffect(() => {
    if (!menu.open) return;
    const content = contentRef.current;
    if (!content) return;
    const items = Array.from(content.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'));
    const target = menu.focusTarget === 'last' ? items.at(-1) : items[0];
    (target ?? content).focus();
    return () => {
      const reference = refs.reference.current as HTMLElement | null;
      if (content.contains(document.activeElement) || document.activeElement === document.body) reference?.focus();
    };
  }, [menu.open, menu.focusTarget, refs.reference]);

  const typeahead = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) return false;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'));
    const current = items.indexOf(document.activeElement as HTMLElement);
    const ordered = [...items.slice(current + 1), ...items.slice(0, current + 1)];
    const match = ordered.find((item) => item.textContent?.trim().toLowerCase().startsWith(event.key.toLowerCase()));
    if (!match) return false;
    event.preventDefault();
    match.focus();
    return true;
  };

  if (!menu.open) return null;
  return createPortal(
    <div
      {...rest}
      ref={mergeRefs(ref, (node) => {
        contentRef.current = node;
        refs.setFloating(node);
      })}
      id={menu.contentId}
      role="menu"
      aria-labelledby={menu.triggerId}
      tabIndex={-1}
      className={classes(styles.content, className)}
      data-placement={placement}
      // eslint-disable-next-line react/forbid-dom-props -- per-instance position (--_x/--_y), see internal/floating.ts
      style={positionStyle}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === 'Tab') {
          menu.setOpen(false);
          return;
        }
        if (typeahead(event)) return;
        rove(event);
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

export type MenuItemTone = 'default' | 'danger';

interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  /** Called when the item is chosen; the menu closes afterwards. */
  onSelect?: () => void;
  /** @default 'default' */
  tone?: MenuItemTone;
  /** Leading glyph, decorative. */
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

function MenuItem({ onSelect, tone = 'default', icon, disabled, className, onClick, ref, children, ...rest }: MenuItemProps) {
  const menu = useMenu('Menu.Item');
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      className={classes(styles.item, className)}
      data-tone={tone}
      data-disabled={disabled ? '' : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        onSelect?.();
        menu.setOpen(false);
      }}
    >
      {icon && <Icon size="inherit">{icon}</Icon>}
      <span className={styles.label}>{children}</span>
    </button>
  );
}

function MenuSeparator({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} role="separator" className={classes(styles.separator, className)} />;
}

Menu.displayName = 'Menu';
MenuTrigger.displayName = 'Menu.Trigger';
MenuContent.displayName = 'Menu.Content';
MenuItem.displayName = 'Menu.Item';
MenuSeparator.displayName = 'Menu.Separator';

Menu.Trigger = MenuTrigger;
Menu.Content = MenuContent;
Menu.Item = MenuItem;
Menu.Separator = MenuSeparator;
