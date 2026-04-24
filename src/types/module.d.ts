import type { DefineComponent } from 'vue';

declare module '*.vue' {
	const Component: DefineComponent<object, object, unknown>;
	export default Component;
}
