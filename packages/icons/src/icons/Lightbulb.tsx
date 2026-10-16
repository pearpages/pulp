// Generated from svg/lightbulb.svg by scripts/generate.mjs. Do not edit.
import type { IconProps } from '../types';

export function Lightbulb({ title, ...props }: IconProps) {
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
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4.9 1.1.9 1.8V17h5.2v-1.3c0-.7.3-1.4.9-1.8A6 6 0 0 0 12 3z" />
      <path d="M9.5 20h5" />
      <path d="M12 13v4" />
    </svg>
  );
}
