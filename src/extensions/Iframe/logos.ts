/**
 * Brand marks for the embed prompt and the slash menu, as SVG markup so the
 * React and Vue views share one drawing. Services without a mark get a
 * monogram on their brand colour (see `EmbedService.color`).
 */

const svg = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">${inner}</svg>`;

const gdoc = (paper: string, fold: string, lines: string) =>
  svg(`<path d="M6 2h8l5 5v15H6z" fill="${paper}"/><path d="M14 2v5h5" fill="${fold}"/>${lines}`);

export const BRAND_LOGOS: Record<string, string> = {
  youtube: svg(
    '<path fill="#FF0000" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8Z"/><path fill="#fff" d="M10 15V9l5.2 3L10 15Z"/>'
  ),
  bilibili: svg(
    '<path fill="#00A1D6" d="M17.8 4.2a1 1 0 0 1 0 1.4L16.4 7H18a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4h1.6L6.2 5.6a1 1 0 1 1 1.4-1.4L10.4 7h3.2l2.8-2.8a1 1 0 0 1 1.4 0ZM18 9H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Zm-9 3a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V13a1 1 0 0 1 1-1Zm6 0a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V13a1 1 0 0 1 1-1Z"/>'
  ),
  figma: svg(
    '<path fill="#0ACF83" d="M8 24a4 4 0 0 0 4-4v-4H8a4 4 0 0 0 0 8Z"/><path fill="#A259FF" d="M4 12a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4Z"/><path fill="#F24E1E" d="M4 4a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4Z"/><path fill="#FF7262" d="M12 0h4a4 4 0 0 1 0 8h-4V0Z"/><path fill="#1ABCFE" d="M20 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/>'
  ),
  codepen: svg(
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"><path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z"/><path d="M12 22v-6.5M22 8.5l-10 7-10-7M2 15.5l10-7 10 7M12 2v6.5"/></g>'
  ),
  spotify: svg(
    '<circle cx="12" cy="12" r="11" fill="#1DB954"/><g fill="none" stroke="#fff" stroke-linecap="round"><path stroke-width="1.9" d="M6.3 9.4c3.9-1.2 8.2-.8 11.4 1.1"/><path stroke-width="1.6" d="M7.1 12.6c3.2-.9 6.6-.5 9.3.9"/><path stroke-width="1.3" d="M7.9 15.6c2.5-.7 5.1-.4 7.3.7"/></g>'
  ),
  googlemaps: svg(
    '<path fill="#EA4335" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z"/><circle cx="12" cy="9" r="2.6" fill="#fff"/>'
  ),
  gdocs: gdoc(
    '#4285F4',
    '#A1C2FA',
    '<path d="M8.5 12h7M8.5 15h7M8.5 18h4.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>'
  ),
  gsheets: gdoc(
    '#34A853',
    '#8ED1A5',
    '<path d="M8.5 11.5h7v7h-7zM8.5 15h7M12 11.5v7" fill="none" stroke="#fff" stroke-width="1.2"/>'
  ),
  gslides: gdoc(
    '#FBBC04',
    '#FDE293',
    '<rect x="8.5" y="12" width="7" height="5" rx="1" fill="#fff"/>'
  ),
  gforms: gdoc(
    '#7248B9',
    '#B39DDB',
    '<path d="M11 12h4.5M11 15h4.5M11 18h4.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><circle cx="8.8" cy="12" r=".9" fill="#fff"/><circle cx="8.8" cy="15" r=".9" fill="#fff"/><circle cx="8.8" cy="18" r=".9" fill="#fff"/>'
  ),
};

/** Whether text on `hex` should be dark (yellow, light blue) rather than white. */
export function isLightColor(hex: string) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}

/** The letter a monogram shows for a service name ("Google Docs" → "G"). */
export function monogramOf(name: string) {
  return [...name.trim()][0]?.toUpperCase() ?? '?';
}
