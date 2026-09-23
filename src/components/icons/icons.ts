import { AspectRatio, MenuDown } from '@/components/icons';

/** Any component that draws a 16px icon from a `className` (and optional click). */
export type IconType = React.ComponentType<{
  className?: string;
  onClick?: React.MouseEventHandler<SVGElement>;
}>;

/**
 * Icons resolved by name — the `icon` of a `button()` config, the `iconName`
 * of a slash command, the `name` of `IconComponent`.
 *
 * The registry starts almost empty. Every icon — Lucide or the editor's own
 * SVGs — is registered by the React control that uses it (`registerIcons` at
 * module scope in `RichTextTable.tsx`, `RichTextBubbleTable.tsx`, …), so a
 * consumer who imports one feature bundles that feature's icons and nothing
 * else.
 */
export const icons: Record<string, IconType> = {
  // Shared by most dropdown controls; every other icon arrives with its feature.
  MenuDown,
  AspectRatio,
};

/**
 * Adds icons to the registry under the names used by `icon` / `iconName`
 * options. Call it at module scope next to the control that needs them, with
 * the Lucide components (or any component taking a `className`) — see
 * docs/guide/customization.md. A host whose own `button()` config names a
 * Lucide icon registers it the same way. Registering a name again replaces
 * the previous component.
 */
export function registerIcons(map: Record<string, IconType | undefined>) {
  for (const name in map) {
    const icon = map[name];

    if (icon) icons[name] = icon;
  }
}
