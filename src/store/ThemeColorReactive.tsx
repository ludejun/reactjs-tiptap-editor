import { useEffect } from 'react';

import { CODE_THEME, THEME, useTheme } from '@/theme/theme';
import { removeCSS, updateCSS } from '@/utils/dynamicCSS';

export function ThemeColorReactive() {
  const { theme, color, borderRadius } = useTheme();

  useEffect(() => {
    const themeValue = theme || 'light';
    const colorValue = color || 'default';

    const themes: Record<string, Record<string, Record<string, string>>> = THEME;
    let themeObject = themes[themeValue]?.[colorValue];

    if (!themeObject) {
      themeObject = THEME['light']['default'];
      return;
    }

    // Syntax colours follow light/dark only, not the accent.
    const codeTheme = CODE_THEME[themeValue === 'dark' ? 'dark' : 'light'];

    updateCSS(
      `
      .reactjs-tiptap-editor, .reactjs-tiptap-editor *,
      .reactjs-tiptap-editor-theme, .reactjs-tiptap-editor-theme *,
      div[data-richtext-portal], div[data-richtext-portal] * {
        ${Object.entries(themeObject)
          .map(([key, value]) => {
            if (typeof borderRadius === 'string' && key === 'radius') {
              return `--${key}: ${borderRadius};`;
            }

            return `--${key}: ${value};`;
          })
          .join('\n')}
        ${Object.entries(codeTheme)
          .map(([key, value]) => `--${key}: ${value};`)
          .join('\n')}
      }
      `,
      'richtext-theme',
      {
        priority: 50,
      }
    );

    return () => {
      removeCSS('richtext-theme');
    };
  }, [theme, color, borderRadius]);

  return <></>;
}
