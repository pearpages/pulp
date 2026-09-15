import { Unstyled } from '@storybook/addon-docs/blocks';
import styles from './Credit.module.css';

/** The author line at the end of every docs page. */
export function Credit() {
  return (
    <Unstyled>
      <p className={styles.credit}>
      pulp is a design system by Pere Pages (<a href="https://github.com/pearpages">@pearpages</a>) ·{' '}
      <a href="https://github.com/pearpages/pulp">Source on GitHub</a> · <a href="https://pearpages.com">pearpages.com</a>
      </p>
    </Unstyled>
  );
}
