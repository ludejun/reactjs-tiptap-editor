/// <reference types="vite/client" />

declare const process;

declare module 'katex/contrib/mhchem';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}
