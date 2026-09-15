import { Badge } from "@pearpages/pulp-react";
import { Fragment } from "react";
import manifest from "../../../packages/react/dist/component-manifest.json";
import { docsPath } from "./paths";
import styles from "./StatusTable.module.css";

const TONE = {
  stable: "success",
  experimental: "warning",
  deprecated: "error",
} as const;
type Status = keyof typeof TONE;

/** Every component in the manifest, grouped by category in sidebar order, with status, entry point and parts; rows link to the docs pages. */
export function StatusTable() {
  const groups = manifest.categories.map((category) => ({
    category,
    rows: manifest.components
      .filter((component) => component.category === category)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
  return (
    <div className={styles.table} role="table" aria-label="Component status">
      <div className={styles.head} role="row">
        <span className={styles.cell} role="columnheader">
          Component
        </span>
        <span className={styles.cell} role="columnheader">
          Status
        </span>
        <span className={styles.cell} role="columnheader">
          Entry
        </span>
        <span className={styles.cell} role="columnheader">
          Parts
        </span>
      </div>
      {groups.map(({ category, rows }) => (
        <Fragment key={category}>
          <div className={styles.row} role="row">
            <span className={styles.group} role="rowheader" aria-colspan={4}>
              {category}
            </span>
          </div>
          {rows.map((component) => (
            <div key={component.name} className={styles.row} role="row">
              <span className={styles.cell} role="rowheader">
                <a href={`?path=${docsPath(component)}`} target="_top">
                  {component.name}
                </a>
              </span>
              <span className={styles.cell} role="cell">
                <Badge
                  tone={TONE[component.status as Status]}
                  variant="subtle"
                  size="sm"
                >
                  {component.status}
                </Badge>
              </span>
              <span className={styles.cell} role="cell">
                <code>{component.import.match(/'([^']+)'/)?.[1]}</code>
              </span>
              <span className={styles.cell} role="cell">
                {component.parts.length || ""}
              </span>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
