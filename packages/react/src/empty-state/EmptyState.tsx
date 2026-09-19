import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Heading, type HeadingLevel } from '../heading';
import { classes } from '../internal/classes';
import { Stack } from '../stack';
import { Text } from '../text';
import styles from './EmptyState.module.css';

export type EmptyStateTone = 'neutral' | 'error';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** What is missing, or what went wrong, in a few words. Rendered as a heading. */
  title: ReactNode;
  /** One or two sentences: why it is empty and what to do about it. */
  description?: ReactNode;
  /** A glyph, shown in a tinted disc. Decorative: the title carries the meaning. */
  icon?: ReactNode;
  /** One control: a Button, or a Link. For an error, the retry. */
  action?: ReactNode;
  /** `error` tints the icon with the error colours. It does not announce anything: see the accessibility notes. @default 'neutral' */
  tone?: EmptyStateTone;
  /** The heading's outline level, from where the empty state sits in the page. @default 3 */
  headingLevel?: HeadingLevel;
  ref?: Ref<HTMLDivElement>;
}

/**
 * What a list, a search or a page shows instead of its content: nothing yet,
 * nothing found, or it failed to load. An icon, a title, a sentence and one
 * action, centred. Composes Heading, Text and Stack, so the type follows the
 * brand without tokens of its own.
 *
 * @status experimental
 * @category Feedback
 * @accessibility The title is a real heading at `headingLevel`, so the empty region shows up in the outline; pick the level from the page, as with Heading. The icon is `aria-hidden`. Nothing is announced on its own: an empty state that is there when the page loads is just content. When it **replaces** content after the user did something (a search with no results, a failed reload), pass `role="status"` (or `role="alert"` for an error that needs attention) so it is read out; do not put `role="alert"` on one that renders with the page. The action is whatever you pass, with its own semantics.
 * @do Say what to do next in the description, and make the action that next step.
 * @do Use `tone="error"` with a retry action when loading failed.
 * @dont Use it for a validation error or a transient message; that is a Field error, an Alert or a Toast.
 * @dont Offer several actions; an empty state has one way forward.
 */
export function EmptyState({ title, description, icon, action, tone = 'neutral', headingLevel = 3, className, ref, ...rest }: EmptyStateProps) {
  return (
    <div {...rest} ref={ref} className={classes(styles.root, className)} data-tone={tone}>
      <Stack gap={4} align="center">
        {icon != null && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <Stack gap={1} align="center">
          <Heading level={headingLevel} size="md" className={styles.text}>
            {title}
          </Heading>
          {description != null && (
            <Text tone="muted" align="center" className={styles.text}>
              {description}
            </Text>
          )}
        </Stack>
        {action}
      </Stack>
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
