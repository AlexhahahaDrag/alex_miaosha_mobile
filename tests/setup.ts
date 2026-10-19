import { vi } from 'vitest';
import { computed, reactive, ref, watch } from 'vue';
import { defineStore } from 'pinia';

/**
 * 为不走 Vite auto-import 的 vitest 环境注入常用 Vue API，
 * 以便可直接 import 依赖 ref/reactive 的业务 config。
 */
Object.assign(globalThis, { ref, reactive, computed, watch, defineStore });

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
