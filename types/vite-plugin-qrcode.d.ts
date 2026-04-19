declare module 'vite-plugin-qrcode' {
	export interface PluginOptions {
		filter?: (url: string) => boolean;
	}
	export function qrcode(options?: Partial<PluginOptions>): import('vite').Plugin;
}
