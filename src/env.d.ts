/// <reference types="vite/client" />

declare module '*.vue' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module '@tsparticles/vue3';
declare module '@tsparticles/slim';

interface ImportMetaEnv {
	readonly VITE_APP_BASE_API: string;
	readonly VITE_APP_TITLE: string;
	readonly VITE_APP_API_PREFIX: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
