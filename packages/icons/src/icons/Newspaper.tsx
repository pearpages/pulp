// Generated from svg/newspaper.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function Newspaper({ title, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M4 5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v13a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V5z" />
      <path d="M16 8h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2" />
      <path d="M8 8h4" />
      <path d="M8 12h4" />
      <path d="M8 16h2" />
    </svg>
  );
}
