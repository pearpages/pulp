import { cloneElement, isValidElement, type ReactElement, type ReactNode, type Ref } from 'react';

type UnknownProps = Record<string, unknown>;

/**
 * Compose two refs into one, so a subcomponent can attach its own ref to a
 * child that already carries the consumer's.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref && typeof ref === 'object') {
        (ref as { current: T | null }).current = value;
      }
    }
  };
}

/**
 * Shared implementation of the `asChild` pattern.
 *
 * Renders `children` in place of the component's own element, merging our props
 * into it rather than replacing them:
 *
 * - `className` is concatenated, the child's first.
 * - Every `on*` handler is composed: the child's runs first, and ours is skipped
 *   if the child called `preventDefault()`. Passing an `onClick` to the child
 *   therefore augments the behaviour instead of silently replacing it. Handlers
 *   listed in `options.replace` are the exception: ours replaces the child's.
 * - Refs are merged, so a component that needs its own ref does not clobber one
 *   the consumer supplied.
 *
 * @param displayName Used in the error message, e.g. 'Modal.Body'.
 */
export interface AsChildOptions {
  /**
   * Handlers that replace the child's instead of composing with it. Used when
   * the control is inert: a disabled control must not run the child's handler.
   */
  replace?: readonly string[];
}

export function renderAsChild(
  displayName: string,
  children: ReactNode,
  props: UnknownProps,
  options: AsChildOptions = {},
): ReactElement {
  if (!isValidElement(children)) {
    throw new Error(`${displayName}: asChild requires a single valid React element as children`);
  }

  const child = children as ReactElement<UnknownProps & { ref?: Ref<unknown> }>;
  const childProps = child.props;
  // `ref` travels inside props (React 19) and is merged, never read.
  const { ref, ...ours } = props as UnknownProps & { ref?: Ref<unknown> };
  const merged: UnknownProps = { ...ours };

  if (typeof props.className === 'string' || typeof childProps.className === 'string') {
    merged.className = [childProps.className, props.className].filter(Boolean).join(' ');
  }

  for (const [key, handler] of Object.entries(ours)) {
    if (!key.startsWith('on') || typeof handler !== 'function') continue;
    if (options.replace?.includes(key)) continue;
    const theirs = childProps[key];
    if (typeof theirs !== 'function') continue;

    merged[key] = (event: unknown, ...rest: unknown[]) => {
      (theirs as (...args: unknown[]) => void)(event, ...rest);
      const prevented = (event as { defaultPrevented?: boolean } | null)?.defaultPrevented;
      if (!prevented) {
        (handler as (...args: unknown[]) => void)(event, ...rest);
      }
    };
  }

  if (ref) {
    merged.ref = mergeRefs(ref, childProps.ref);
  } else if (childProps.ref) {
    merged.ref = childProps.ref;
  }

  return cloneElement(child, merged);
}
