---
description: Internationalization

next:
  text: Custom Theme
  link: /guide/custom-theme.md
---

# Internationalization

The library includes translations for its controls and dialogs. English (`en`) is the default. Changing the locale changes interface text; it does not translate document content.

## Choose a language

The lightweight `/locale` entry includes English only. Import and register each additional dictionary before selecting its language. Use `localeActions.setLang` during application initialization or in an event handler:

```tsx
import { localeActions, useLocale } from 'richkit/locale';
import vi from 'richkit/locales/vi';
import ja from 'richkit/locales/ja';

localeActions.setMessage('vi', vi);
localeActions.setMessage('ja', ja);

export function LanguagePicker() {
  const { lang } = useLocale();

  return (
    <select
      aria-label='Editor language'
      value={lang}
      onChange={(event) => localeActions.setLang(event.target.value)}
    >
      <option value='en'>English</option>
      <option value='vi'>Tiếng Việt</option>
      <option value='ja'>日本語</option>
    </select>
  );
}
```

`useLocale()` returns `lang` (the language code) and `t` (a translation function). Call the hook inside a React component. Use `localeActions.setLang` to change the language by code.

Locale state is shared across editor instances in the application. The library does not automatically persist a language choice across reloads; restore your application's preference when initializing the client.

## Included languages

Ordered by the number of speakers worldwide.

| Language             | Code    | Dictionary subpath |
| -------------------- | ------- | ------------------ |
| English              | `en`    | `/locales/en`      |
| Simplified Chinese   | `zh_CN` | `/locales/zh-cn`   |
| Hindi                | `hi`    | `/locales/hi`      |
| Spanish              | `es`    | `/locales/es`      |
| French               | `fr`    | `/locales/fr`      |
| Bengali              | `bn`    | `/locales/bn`      |
| Brazilian Portuguese | `pt_BR` | `/locales/pt-br`   |
| Russian              | `ru`    | `/locales/ru`      |
| Indonesian           | `id`    | `/locales/id`      |
| German               | `de`    | `/locales/de`      |
| Japanese             | `ja`    | `/locales/ja`      |
| Turkish              | `tr`    | `/locales/tr`      |
| Vietnamese           | `vi`    | `/locales/vi`      |
| Korean               | `ko`    | `/locales/ko`      |
| Italian              | `it`    | `/locales/it`      |
| Hungarian            | `hu_HU` | `/locales/hu`      |
| Finnish              | `fi`    | `/locales/fi`      |

Use the exact code, including underscores and capitalization: three codes differ from their file name (`zh_CN` → `/locales/zh-cn`, `pt_BR` → `/locales/pt-br`, `hu_HU` → `/locales/hu`). Each dictionary has a default export. For example, register `/locales/pt-br` under the language code `pt_BR`.

No right-to-left language ships yet: the editor's own chrome (toolbar, dialogs, bubble menus) is laid out left-to-right, so an RTL dictionary alone would leave the interface mirrored incorrectly. Right-to-left _document content_ is supported through the Text Direction control regardless of the interface language.

### Load languages on demand

Importing all sixteen non-English dictionaries costs about 61 kB gzipped.
Loading one only when the reader picks it keeps the initial bundle at English
alone; each dictionary is its own chunk of roughly 3.5 to 4.5 kB.

The loader has to be written out per language. A bundler cannot follow a
computed specifier, so ``import(`richkit/locales/${code}`)`` either
fails to build or quietly pulls in all of them — the map below keeps every
specifier a literal:

```tsx
import { useState } from 'react';
import { localeActions, useLocale } from 'richkit/locale';

type Loader = () => Promise<{ default: Record<string, string> }>;

/** English needs no loader: the `/locale` entry already registers it. */
const LANGUAGES: { code: string; label: string; load?: Loader }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh_CN', label: '中文', load: () => import('richkit/locales/zh-cn') },
  { code: 'hi', label: 'हिन्दी', load: () => import('richkit/locales/hi') },
  { code: 'es', label: 'Español', load: () => import('richkit/locales/es') },
  { code: 'fr', label: 'Français', load: () => import('richkit/locales/fr') },
  { code: 'bn', label: 'বাংলা', load: () => import('richkit/locales/bn') },
  { code: 'pt_BR', label: 'Português', load: () => import('richkit/locales/pt-br') },
  { code: 'ru', label: 'Русский', load: () => import('richkit/locales/ru') },
  { code: 'id', label: 'Bahasa Indonesia', load: () => import('richkit/locales/id') },
  { code: 'de', label: 'Deutsch', load: () => import('richkit/locales/de') },
  { code: 'ja', label: '日本語', load: () => import('richkit/locales/ja') },
  { code: 'tr', label: 'Türkçe', load: () => import('richkit/locales/tr') },
  { code: 'vi', label: 'Tiếng Việt', load: () => import('richkit/locales/vi') },
  { code: 'ko', label: '한국어', load: () => import('richkit/locales/ko') },
  { code: 'it', label: 'Italiano', load: () => import('richkit/locales/it') },
  { code: 'hu_HU', label: 'Magyar', load: () => import('richkit/locales/hu') },
  { code: 'fi', label: 'Suomi', load: () => import('richkit/locales/fi') },
];

/** Locale state is global, so the cache of loaded dictionaries can be too. */
const registered = new Set(['en']);

export async function selectLanguage(code: string) {
  const entry = LANGUAGES.find((language) => language.code === code);

  if (entry?.load && !registered.has(code)) {
    const { default: messages } = await entry.load();

    localeActions.setMessage(code, messages);
    registered.add(code);
  }

  // Register before selecting, or the interface flashes English first.
  localeActions.setLang(code);
}

export function LanguagePicker() {
  const { lang } = useLocale();
  const [pending, setPending] = useState<string | null>(null);

  async function onSelect(code: string) {
    setPending(code);

    try {
      await selectLanguage(code);
    } catch {
      // A failed chunk leaves the current language in place rather than
      // dropping the reader back to English.
    } finally {
      setPending(null);
    }
  }

  return (
    <select
      aria-label='Editor language'
      disabled={pending !== null}
      value={lang}
      onChange={(event) => onSelect(event.target.value)}
    >
      {LANGUAGES.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}
```

### Match the browser language

`navigator.language` is a BCP 47 tag (`pt-BR`, `de-AT`, `ja`), which does not
line up with the codes above: three of them use an underscore. Match the exact
tag first, then fall back to the base language:

```ts
/** Reuses LANGUAGES and selectLanguage from the previous example. */
function matchBrowserLanguage(tag: string) {
  const wanted = tag.toLowerCase().replace('_', '-');
  const base = wanted.split('-')[0];
  const normalize = (code: string) => code.toLowerCase().replace('_', '-');

  return (
    LANGUAGES.find((language) => normalize(language.code) === wanted) ??
    LANGUAGES.find((language) => normalize(language.code).split('-')[0] === base)
  );
}

// In a client-only effect, or wherever you initialize the editor:
const match = matchBrowserLanguage(navigator.language);

if (match) {
  await selectLanguage(match.code);
}
```

Base matching is approximate where one base language ships in a single variant:
`zh-TW` falls back to `zh_CN`, so a reader in Taiwan sees Simplified Chinese.
Map those cases explicitly if it matters to your users.

### Compatibility entry

Existing imports from `richkit/locale-bundle` still work and register all included languages automatically. Use that entry when you need all languages; use `/locale` and individual dictionaries to avoid loading unused translations. Both entries share the same locale state.

## Override existing messages

`setMessage` merges the supplied keys into the language's current messages. You can override a single label without copying the entire dictionary:

```ts
import { localeActions } from 'richkit/locale';

localeActions.setMessage('en', {
  'editor.remove': 'Delete',
});
```

## Add a language

Start from the exported English dictionary, override the keys you have translated, then select the new language:

```ts
import { en, localeActions } from 'richkit/locale';

localeActions.setMessage('fr', {
  ...en,
  'editor.remove': 'Supprimer',
});
localeActions.setLang('fr');
```

The English spread is optional: missing translations fall back to the current English messages, then to the message key if English also has no value. Register messages before selecting a new code to avoid showing English while its dictionary loads.

## Use translations in custom controls

```tsx
import { useLocale } from 'richkit/locale';

export function RemoveLabel() {
  const { t } = useLocale();
  return <span>{t('editor.remove')}</span>;
}
```

For messages containing placeholders such as `{count}`, pass a values object as the second argument to `t`. Preserve placeholder names when translating. The exported `en` object and TypeScript completion provide the available message keys.
