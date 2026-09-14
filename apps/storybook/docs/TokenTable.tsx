import styles from './TokenTable.module.css';

interface Token {
  name: string;
  type: string;
  tier: string;
  css: string;
  value?: string;
  light?: string;
  dark?: string;
  description?: string;
}

interface Props {
  tokens: Token[];
  tier: 'primitive' | 'semantic' | 'component';
  brand: string;
}

// A grid, not a <table>: the Storybook docs container restyles tables and
// hides overflowing columns. Roles keep it a table for assistive technology.
export function TokenTable({ tokens, tier, brand }: Props) {
  const rows = tokens.filter((token) => token.tier === tier);
  return (
    <div className={styles.table} role="table" data-brand={brand}>
      <div className={styles.head} role="row">
        <span role="columnheader">Token</span>
        <span role="columnheader">Preview</span>
        <span role="columnheader">Value</span>
      </div>
      {rows.map((token) => (
        <div className={styles.row} role="row" key={token.name}>
          <span role="cell" className={styles.name}>
            <code>{token.name}</code>
            {token.description && <span className={styles.description}>{token.description}</span>}
          </span>
          <span role="cell" className={styles.preview}>
            <Preview token={token} />
          </span>
          <span role="cell" className={styles.values}>
            {token.light !== undefined ? (
              <>
                <span>light {token.light}</span>
                <span>dark {token.dark}</span>
              </>
            ) : (
              <span>{token.value}</span>
            )}
            {token.css.includes('var(') && <span className={styles.ref}>{token.css}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function Preview({ token }: { token: Token }) {
  // The one legitimate inline style in the repo: the swatch has to show
  // whatever token it documents, and a stylesheet cannot enumerate them.
  // Same reasoning as a per-cell animation delay. Everything else is banned.
  switch (token.type) {
    case 'color':
      // eslint-disable-next-line react/forbid-dom-props -- dynamic token preview, see above
      return <span className={styles.swatch} style={{ background: `var(${token.name})` }} />;
    case 'shadow':
      // eslint-disable-next-line react/forbid-dom-props -- dynamic token preview
      return <span className={styles.swatch} style={{ boxShadow: `var(${token.name})` }} />;
    case 'fontFamily':
      // eslint-disable-next-line react/forbid-dom-props -- dynamic token preview
      return <span style={{ fontFamily: `var(${token.name})` }}>Sphinx of black quartz</span>;
    case 'dimension':
      // eslint-disable-next-line react/forbid-dom-props -- dynamic token preview
      return <span className={styles.bar} style={{ inlineSize: `var(${token.name})` }} />;
    default:
      return null;
  }
}
