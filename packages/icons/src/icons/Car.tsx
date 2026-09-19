// Generated from svg/car.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function Car({ title, ...props }: IconProps) {
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
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
      <path d="M3 17v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4z" />
      <path d="M6 17v2" />
      <path d="M18 17v2" />
      <path d="M7 14h.01" />
      <path d="M17 14h.01" />
    </svg>
  );
}
