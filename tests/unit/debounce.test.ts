import { describe, it, expect, vi } from 'vitest';
import { debounce } from '@/utils/common';

describe('debounce utility', () => {
	it('should delay execution of callback', () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const debounced = debounce(fn, 200);

		debounced();
		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(199);
		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(fn).toHaveBeenCalledTimes(1);

		vi.useRealTimers();
	});

	it('should execute only once when called multiple times rapidly', () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced('call 1');
		debounced('call 2');
		debounced('call 3');

		vi.advanceTimersByTime(300);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith('call 3');

		vi.useRealTimers();
	});

	it('should support manual cancellation', () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced();
		debounced.cancel();

		vi.advanceTimersByTime(500);
		expect(fn).not.toHaveBeenCalled();

		vi.useRealTimers();
	});
});
