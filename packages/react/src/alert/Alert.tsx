import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Check, Close, Info, Warning } from '@pearpages/pulp-icons';
import { Icon } from '../icon';
import { IconButton } from '../icon-button';
import { classes } from '../internal/classes';
import styles from './Alert.module.css';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';
export type AlertLive = 'polite' | 'assertive' | 'off';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** @default 'info' */
  tone?: AlertTone;
  title?: ReactNode;
  /** Replaces the tone's default glyph; `null` shows none. */
  icon?: ReactNode | null;
  /** Buttons or links placed under the body. */
  action?: ReactNode;
  /** Renders a dismiss button that calls this. */
  onDismiss?: () => void;
  /** @default 'Dismiss' */
  dismissLabel?: string;
  /**
   * How assistive technology announces it: `assertive` (`role="alert"`),
   * `polite` (`role="status"`) or `off` (no live role, for content present at
   * page load or inside another live region). Defaults to assertive for
   * `error`, polite otherwise.
   */
  live?: AlertLive;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

const DEFAULT_ICON: Record<AlertTone, ReactNode> = {
  info: <Info />,
  success: <Check />,
  warning: <Warning />,
  error: <Warning />,
};

/**
 * An inline message with a tone. Tint, accent and title colour come from
 * the status tokens; the body keeps the default text colour so long
 * messages stay readable. Toast renders one Alert per notification.
 */
export function Alert({
  tone = 'info',
  title,
  icon,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  live,
  className,
  ref,
  children,
  ...rest
}: AlertProps) {
  const mode = live ?? (tone === 'error' ? 'assertive' : 'polite');
  const role = mode === 'off' ? undefined : mode === 'assertive' ? 'alert' : 'status';
  const glyph = icon === undefined ? DEFAULT_ICON[tone] : icon;

  return (
    <div {...rest} ref={ref} role={role} className={classes(styles.alert, className)} data-tone={tone}>
      {glyph && (
        <Icon size="md" className={styles.icon}>
          {glyph}
        </Icon>
      )}
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.content}>{children}</div>}
        {action && <div className={styles.action}>{action}</div>}
      </div>
      {onDismiss && (
        <IconButton variant="ghost" size="sm" label={dismissLabel} icon={<Close />} onClick={onDismiss} className={styles.dismiss} />
      )}
    </div>
  );
}

Alert.displayName = 'Alert';
