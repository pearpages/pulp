/** Join class names, dropping falsy entries. */
export function classes(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}
