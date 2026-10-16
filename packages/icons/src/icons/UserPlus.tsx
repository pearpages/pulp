// Generated from svg/user-plus.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function UserPlus({ title, ...props }: IconProps) {
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
      <circle cx="10" cy="8" r="4" />
      <path d="M3 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
      <path d="M19 8.5v5" />
      <path d="M16.5 11h5" />
    </svg>
  );
}
