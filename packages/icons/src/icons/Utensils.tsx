// Generated from svg/utensils.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function Utensils({ title, ...props }: IconProps) {
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
      <path d="M5 3v6a3 3 0 0 0 6 0V3" />
      <path d="M8 3v18" />
      <path d="M18 21V3c-2.5 1.5-4 5-4 10h4" />
    </svg>
  );
}
