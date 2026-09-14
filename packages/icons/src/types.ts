import type { SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /**
   * Accessible name. Without it the icon is decorative (`aria-hidden`); with
   * it the icon is an image named by a `<title>`.
   */
  title?: string;
}
