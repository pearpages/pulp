import { Unstyled } from '@storybook/addon-docs/blocks';
import pkg from '../../../packages/react/package.json';
import styles from './Masthead.module.css';

/** Wordmark, tagline, author, the released version and links at the top of the Introduction. */
export function Masthead() {
  return (
    <Unstyled>
      <header className={styles.masthead}>
      {/* One per scheme; the stylesheet shows the one that matches the page. */}
      <img className={`${styles.wordmark} ${styles.wordmarkLight}`} src="wordmark.svg" alt="pulp" width={112} height={32} />
      <img className={`${styles.wordmark} ${styles.wordmarkDark}`} src="wordmark-dark.svg" alt="pulp" width={112} height={32} />
      <p className={styles.tagline}>A design system built to outlive its frameworks.</p>
      <p className={styles.byline}>
        Tokens, CSS and React components with guardrails that CI enforces. By Pere Pages, <a href="https://github.com/pearpages">@pearpages</a>.
      </p>
      <ul className={styles.links}>
        <li>
          <a href={`https://github.com/pearpages/pulp/releases/tag/v${pkg.version}`}>Version {pkg.version}</a>
        </li>
        <li>
          <a href="https://github.com/pearpages/pulp">GitHub</a>
        </li>
        <li>
          <a href="https://pearpages.com">pearpages.com</a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/pearpages/">LinkedIn</a>
        </li>
      </ul>
      </header>
    </Unstyled>
  );
}
