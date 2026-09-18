// Generated from svg/settings.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function Settings({ title, ...props }: IconProps) {
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
      <path d="M4 6h8.5M17.5 6H20M4 12h2.5M11.5 12H20M4 18h10.5M19.5 18h.5" />
      <circle cx="15" cy="6" r="2.5" />
      <circle cx="9" cy="12" r="2.5" />
      <circle cx="17" cy="18" r="2.5" />
    </svg>
  );
}
