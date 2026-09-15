import { Fragment } from 'react';
import { Canvas, Controls, Description, Markdown, Primary, Source, Stories, Subheading, Title, Unstyled, useOf } from '@storybook/addon-docs/blocks';
import { Badge } from '@pearpages/pulp-react';
import { Credit } from './Credit';
import manifest from '../../../packages/react/dist/component-manifest.json';
import styles from './ComponentDocs.module.css';

type Entry = (typeof manifest)['components'][number];
const byName = new Map<string, Entry>(manifest.components.map((component) => [component.name, component]));
const TONE = { stable: 'success', experimental: 'warning', deprecated: 'error' } as const;

/**
 * The docs page every component gets. Everything but the stories comes from
 * the component manifest, which comes from the component's JSDoc, so the
 * page, the status page and coding agents read one source. The four brand ×
 * scheme matrix stories are tests and are not rendered here.
 */
export function ComponentDocs() {
  const { csfFile, preparedMeta } = useOf('meta', ['meta']);
  const component = preparedMeta.component as { displayName?: string } | undefined;
  const entry = component?.displayName ? byName.get(component.displayName) : undefined;
  const stories = Object.values(csfFile.stories);
  const matrices = stories.filter((story) => story.name.startsWith('Matrix'));
  const others = stories.slice(1).filter((story) => !story.name.startsWith('Matrix'));

  if (!entry) {
    return (
      <>
        <Title />
        <Description />
        <Primary />
        <Controls />
        <Stories />
        <Credit />
      </>
    );
  }

  const status = entry.status as keyof typeof TONE;
  const needs = [
    `import { ${entry.name} } from '@pearpages/pulp-react/${entry.import.match(/pulp-react\/([a-z-]+)'/)?.[1]}';`,
  ];
  const css = [`@import "@pearpages/pulp-react/${entry.css.replace('@pearpages/pulp-react/', '')}"; /* or styles.css once for everything */`];
  if (entry.name.startsWith('Dialog')) css.push(`@import "@pearpages/modals/styles.css" layer(vendor);`);

  return (
    <>
      <Title />
      <Unstyled>
        <div className={styles.status}>
          <Badge tone={TONE[status]} variant="subtle">
            {entry.status}
          </Badge>
          <span>
            {entry.category} · Tokens <code>{entry.tokens}</code>
            {matrices.length > 0 && ` · ${matrices.length} matrix stories run as tests in every brand and scheme`}
          </span>
        </div>
      </Unstyled>
      <Markdown>{entry.description}</Markdown>

      <Subheading>Use it</Subheading>
      <Source language="tsx" code={needs.join('\n')} />
      <Source language="css" code={css.join('\n')} />
      {entry.description.includes('React Aria') && <Markdown>{`Built on React Aria Components (decision record 001); the dependency installs with the package and is tree-shaken per entry.`}</Markdown>}

      <Subheading>Accessibility</Subheading>
      <Markdown>{entry.accessibility}</Markdown>

      {(entry.do.length > 0 || entry.dont.length > 0) && (
        <Unstyled>
          <div className={styles.columns}>
            <div>
              <Subheading>Do</Subheading>
              <ul className={styles.list}>
                {entry.do.map((item) => (
                  <li key={item}>
                    <Markdown>{item}</Markdown>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Subheading>Don't</Subheading>
              <ul className={styles.list}>
                {entry.dont.map((item) => (
                  <li key={item}>
                    <Markdown>{item}</Markdown>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Unstyled>
      )}

      <Primary />
      <Controls />

      {entry.parts.length > 0 && (
        <>
          <Subheading>Parts</Subheading>
          <Unstyled>
            <ul className={styles.parts}>
              {entry.parts.map((part) => (
                <li key={part.name}>
                  <code>{part.name}</code>
                  {part.props.length > 0 && <> · {part.props.map((prop) => prop.name).join(', ')}</>}
                  {part.description && <Markdown>{part.description}</Markdown>}
                </li>
              ))}
            </ul>
          </Unstyled>
        </>
      )}

      {others.map((story) => (
        <Fragment key={story.id}>
          <Subheading>{story.name}</Subheading>
          <Canvas of={story.moduleExport} />
        </Fragment>
      ))}
      <Credit />
    </>
  );
}
