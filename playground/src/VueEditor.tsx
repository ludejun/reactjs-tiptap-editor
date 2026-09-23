import { useEffect, useRef } from 'react';
import { createApp, type App as VueApp } from 'vue';

import PlaygroundVue from './vue/PlaygroundVue.vue';

/**
 * The Vue editor, mounted inside the React playground so the two UI layers
 * can be compared in place. It is a complete Vue app: `ai-sparkwrite-editor/core`
 * for the extensions, `ai-sparkwrite-editor/vue` for the UI.
 */
export function VueEditor({ dark }: { dark: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const app = useRef<VueApp | null>(null);

  useEffect(() => {
    if (!host.current) return;
    const instance = createApp(PlaygroundVue, { dark });
    instance.mount(host.current);
    app.current = instance;
    return () => {
      instance.unmount();
      app.current = null;
    };
    // Theme changes re-mount; the Vue app is cheap and holds no unsaved state
    // the React side cares about.
  }, [dark]);

  return <div ref={host} />;
}
