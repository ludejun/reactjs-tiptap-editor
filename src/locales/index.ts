import { useCallback, useSyncExternalStore } from 'react';

import { formatMessage, getLocaleState, localeActions, subscribeLocale } from './store';

import type { MessageKeysType } from './store';

export * from './store';

/** Current language and a `t()` that re-renders the component on change. */
function useLocale() {
  const { currentLang, message } = useSyncExternalStore(
    subscribeLocale,
    getLocaleState,
    getLocaleState
  );

  const t = useCallback(
    (path: MessageKeysType, params?: Record<string, string | number>): string => {
      try {
        const template = message[currentLang]?.[path] || message.en?.[path] || path;

        return formatMessage(template, params);
      } catch {
        return path;
      }
    },
    [message, currentLang]
  );

  return { setLang: localeActions.setLang, lang: currentLang, t };
}

export { useLocale };
