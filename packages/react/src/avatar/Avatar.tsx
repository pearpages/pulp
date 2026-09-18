import { useState, type HTMLAttributes, type ReactElement, type Ref } from 'react';
import { renderAsChild } from '../internal/asChild';
import { classes } from '../internal/classes';
import styles from './Avatar.module.css';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The person's name. Its initials show when there is no image or the image fails, and it names the avatar unless `alt` does. */
  name?: string;
  /** Image URL. Ignored when an image element is passed as the child. */
  src?: string;
  /** Accessible name. Defaults to `name`. Pass `""` next to the visible name, so it is not read twice. */
  alt?: string;
  /** `sm` and `md` match the control heights, so an avatar lines up with a button. @default 'md' */
  size?: AvatarSize;
  /**
   * An image element to use instead of `img`: a framework's image component
   * (`<Avatar name="Ana"><Image src={url} alt="" width={40} height={40} /></Avatar>`).
   * It receives the styles and the error handling; its own `alt` is replaced by the avatar's.
   */
  children?: ReactElement;

  ref?: Ref<HTMLSpanElement>;
}

/** "Ana María Ruiz" → "AR"; one word → its first letter. By code point, so an accent or an emoji is one character. */
function initialsOf(name: string | undefined) {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const first = Array.from(words[0] ?? '')[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1] ?? '')[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * A person, as a picture or as initials. The initials take over when no image
 * is given and when the image fails to load, so a broken URL never shows a
 * broken-image glyph. Every value comes from `--avatar-*` tokens; the
 * background is one token for everyone, not a colour computed from the name.
 *
 * @status experimental
 * @category Utilities
 * @accessibility With an image, the `img` carries the name as its `alt`. With initials, the root is `role="img"` named by `alt` or `name`, and the letters are hidden from assistive technology ("AR" read aloud means nothing). `alt=""` makes the avatar decorative (`aria-hidden`): use it when the name is written next to it. Not focusable and not interactive; wrap it in a Link or a Button to make it one.
 * @do Pass `name` always, even with an image: it is the fallback when the image fails.
 * @do Pass `alt=""` when the person's name is visible beside the avatar.
 * @dont Colour avatars per person from a hash of the name; the colours will not be tokens and will not pass contrast in both schemes.
 * @dont Use it for a logo or an illustration; it crops to a circle and falls back to initials.
 */
export function Avatar({ name, src, alt, size = 'md', className, ref, children, ...rest }: AvatarProps) {
  const source = children ? children : src;
  // Keyed on what failed, so a new `src` (or a new image element) gets a fresh attempt without an effect.
  const [failed, setFailed] = useState<unknown>(null);
  const showImage = source != null && failed !== source;

  const label = alt ?? name ?? '';
  const decorative = label === '';
  const image = { className: styles.image, alt: label, onError: () => setFailed(source) };

  return (
    <span
      {...rest}
      ref={ref}
      className={classes(styles.root, className)}
      data-size={size}
      data-fallback={showImage ? undefined : ''}
      role={showImage || decorative ? undefined : 'img'}
      aria-label={showImage || decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
    >
      {showImage ? (
        children ? (
          renderAsChild('Avatar', children, image)
        ) : (
          <img {...image} src={src} />
        )
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}

Avatar.displayName = 'Avatar';
