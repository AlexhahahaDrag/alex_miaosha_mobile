import { vi } from 'vitest';
import { computed, reactive, ref, watch, watchEffect, toValue } from 'vue';
import { defineStore } from 'pinia';

/**
 * 为不走 Vite auto-import 的 vitest 环境注入常用 Vue API，
 * 以便可直接 import 依赖 ref/reactive 的业务 config。
 */
Object.assign(globalThis, { ref, reactive, computed, watch, watchEffect, toValue, defineStore });

// Node 单测环境内存 localStorage 垫片
if (typeof globalThis.localStorage === 'undefined') {
	const storage = new Map<string, string>();
	const localStoragePolyfill = {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, String(value)),
		removeItem: (key: string) => storage.delete(key),
		clear: () => storage.clear(),
		get length() {
			return storage.size;
		},
		key: (i: number) => Array.from(storage.keys())[i] ?? null,
	};
	Object.defineProperty(globalThis, 'localStorage', {
		value: localStoragePolyfill,
		writable: true,
	});
}

// Node 单测环境 navigator.vibrate 垫片
if (typeof globalThis.navigator === 'undefined') {
	Object.defineProperty(globalThis, 'navigator', {
		value: { vibrate: vi.fn().mockReturnValue(true) },
		writable: true,
	});
} else if (!globalThis.navigator.vibrate) {
	Object.defineProperty(globalThis.navigator, 'vibrate', {
		value: vi.fn().mockReturnValue(true),
		writable: true,
	});
}

if (typeof window !== 'undefined') {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});

	class ResizeObserverStub {
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
	}

	Object.defineProperty(window, 'ResizeObserver', {
		writable: true,
		value: ResizeObserverStub,
	});
}
