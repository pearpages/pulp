// Generated from svg/undo.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function Undo({ title, ...props }: IconProps) {
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
      <polyline points="9,14 4,9 9,4" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </svg>
  );
}
