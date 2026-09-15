import { Badge } from '@pearpages/pulp-react';
import manifest from '../../../packages/react/dist/component-manifest.json';
import styles from './StatusTable.module.css';

const ORDER = { stable: 0, experimental: 1, deprecated: 2 } as const;
const TONE = { stable: 'success', experimental: 'warning', deprecated: 'error' } as const;
type Status = keyof typeof ORDER;

// Story titles are `Components/<Name>`; a few components share a stories file.
const STORY_OF: Record<string, string> = { DialogSystem: 'Dialog', Radio: 'RadioGroup', ToastProvider: 'Toast' };
// Storybook lowercases the title as is: 'Components/IconButton' becomes components-iconbutton.
const docsPath = (name: string) => `/docs/components-${(STORY_OF[name] ?? name).toLowerCase()}--docs`;

/** Every component in the manifest with its status, entry point and parts; the rows link to the docs pages. */
export function StatusTable() {
  const rows = [...manifest.components].sort(
    (a, b) => ORDER[a.status as Status] - ORDER[b.status as Status] || a.name.localeCompare(b.name),
  );
  return (
    <div className={styles.table} role="table" aria-label="Component status">
      <div className={styles.head} role="row">
        <span className={styles.cell} role="columnheader">Component</span>
        <span className={styles.cell} role="columnheader">Status</span>
        <span className={styles.cell} role="columnheader">Entry</span>
        <span className={styles.cell} role="columnheader">Parts</span>
      </div>
      {rows.map((component) => (
        <div key={component.name} className={styles.row} role="row">
          <span className={styles.cell} role="rowheader">
            <a href={`?path=${docsPath(component.name)}`} target="_top">
              {component.name}
            </a>
          </span>
          <span className={styles.cell} role="cell">
            <Badge tone={TONE[component.status as Status]} variant="subtle" size="sm">
              {component.status}
            </Badge>
          </span>
          <span className={styles.cell} role="cell">
            <code>{component.import.match(/'([^']+)'/)?.[1]}</code>
          </span>
          <span className={styles.cell} role="cell">
            {component.parts.length || ''}
          </span>
        </div>
      ))}
    </div>
  );
}
