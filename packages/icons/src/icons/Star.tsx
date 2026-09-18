// Generated from svg/star.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function Star({ title, ...props }: IconProps) {
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
      <polygon points="12,3 14.8,8.9 21,9.7 16.4,14 17.6,20.3 12,17.2 6.4,20.3 7.6,14 3,9.7 9.2,8.9" />
    </svg>
  );
}
