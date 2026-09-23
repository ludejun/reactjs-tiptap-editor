/** The built-in callout kinds, their labels and the colours both node views paint them with. */
export const CALLOUT_TYPES = [
  { value: 'note', label: 'Note', color: '#1f6feb', background: '#1f6feb1f' },
  { value: 'tip', label: 'Tip', color: '#238636', background: '#2386361f' },
  { value: 'important', label: 'Important', color: '#ab7df8', background: '#ab7df81f' },
  { value: 'warning', label: 'Warning', color: '#d29922', background: '#d299221f' },
  { value: 'caution', label: 'Caution', color: '#f85149', background: '#f851491f' },
] as const;

export type CalloutType = (typeof CALLOUT_TYPES)[number]['value'];

/** The definition for `type`, falling back to `note` for unknown values. */
export function getCalloutType(type: string | null | undefined) {
  return CALLOUT_TYPES.find((item) => item.value === type) ?? CALLOUT_TYPES[0];
}
