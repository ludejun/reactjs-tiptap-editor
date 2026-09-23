export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | Record<string, unknown>;

/**
 * Joins class names the way `clsx` does: strings and numbers are kept, arrays
 * are flattened, object keys are kept when their value is truthy, and anything
 * falsy is skipped. There is no Tailwind conflict resolution on purpose — the
 * editor's classes are `richtext-` prefixed (which tailwind-merge does not
 * recognise anyway) and the stylesheet order decides.
 */
export function cn(...inputs: ClassValue[]): string {
  let result = '';

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      result += (result ? ' ' : '') + input;
    } else if (Array.isArray(input)) {
      const nested = cn(...input);

      if (nested) result += (result ? ' ' : '') + nested;
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) result += (result ? ' ' : '') + key;
      }
    }
  }

  return result;
}
