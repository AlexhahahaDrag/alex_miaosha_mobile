/// <reference types="vite/client" />

declare module '*.vue' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'particles.vue3';

interface ImportMetaEnv {
	readonly VITE_APP_BASE_API: string;
	readonly VITE_APP_TITLE: string;
	readonly VITE_APP_API_PREFIX: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
