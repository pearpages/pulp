// Generated from svg/send.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function Send({ title, ...props }: IconProps) {
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
      <polygon points="21,3 14,21 11,13 3,10" />
      <path d="M21 3L11 13" />
    </svg>
  );
}
