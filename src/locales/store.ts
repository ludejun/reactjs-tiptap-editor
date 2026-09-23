import { DEFAULT_LANG_VALUE } from '@/constants';

import en from './en';

const LANG = {
  currentLang: DEFAULT_LANG_VALUE,
  message: {
    en,
  },
};

// // Define message key types based on the 'en' locale
type MessageKeysType = keyof typeof en | (string & {});
type LanguageType = keyof typeof LANG.message | (string & {});

// Proxy for reactive language state
interface LangState {
  currentLang: LanguageType;
  message: Record<string, Partial<Record<MessageKeysType, string>>>;
}

/**
 * A dependency-free store so the translations work from any framework: the
 * React hook in ./index.ts subscribes with useSyncExternalStore, and Vue or
 * vanilla code can call `translate` / `localeActions` and `subscribe`.
 */
let state: LangState = { currentLang: LANG.currentLang, message: LANG.message };
const listeners = new Set<() => void>();

function setState(update: (previous: LangState) => LangState) {
  state = update(state);
  listeners.forEach((listener) => listener());
}

/** Current language and messages. */
export function getLocaleState(): LangState {
  return state;
}

/** Notifies on every language or message change; returns the unsubscribe. */
export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/** Fills `{name}` placeholders. */
export function formatMessage(template: string, params?: Record<string, string | number>) {
  if (!params) return template;

  return Object.entries(params).reduce(
    (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template
  );
}

/** Translate outside React: the AI transport, paste rules, node specs. */
function translate(path: MessageKeysType, params?: Record<string, string | number>): string {
  try {
    const { currentLang, message } = state;
    const template = message[currentLang]?.[path] || message.en?.[path] || path;

    return formatMessage(template, params);
  } catch {
    return path;
  }
}

const localeActions = {
  setLang: (lang: LanguageType | (string & {})) => {
    setState((prev) => ({ ...prev, currentLang: lang }));
  },
  setMessage: (
    lang: LanguageType | (string & {}),
    messages: Partial<Record<keyof typeof LANG.message.en, string>>
  ) => {
    setState((prev) => ({
      ...prev,
      message: {
        ...prev.message,
        [lang]: { ...prev.message[lang as keyof typeof LANG.message], ...messages },
      },
    }));
  },
};

export { localeActions, translate };
export { en };
export type { LangState, LanguageType, MessageKeysType };
