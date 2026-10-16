// Generated from svg/flag.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function Flag({ title, ...props }: IconProps) {
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
      <path d="M5 21V3" />
      <path d="M5 4l13 4.5L5 13" />
    </svg>
  );
}
