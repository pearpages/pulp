// Generated from svg/pencil.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function Pencil({ title, ...props }: IconProps) {
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
      <path d="M4 20l1-5L16 4l4 4L9 19z" />
      <path d="M14 6l4 4" />
    </svg>
  );
}
