import { describe, it, expect } from 'vitest';
import {
	formatDate,
	formatTime,
	formatMonth,
	formatDayjs,
	nowDayjs,
	getMonthRange,
	getMonthRangeDayjs,
} from '@/utils/dayjs';

describe('mobile utils/dayjs module', () => {
	it('formatDate formats strings and objects correctly', () => {
		expect(formatDate('2026-10-12 15:30:00')).toBe('2026-10-12');
		expect(formatDate(null)).toBe('');
		expect(formatDate(undefined)).toBe('');
	});

	it('formatTime formats dates with default and custom formats', () => {
		expect(formatTime('2026-10-12 15:30:00')).toBe('2026-10-12 15:30:00');
		expect(formatTime('2026-10-12 15:30:00', 'YYYY-MM-DDTHH:mm:ss')).toBe('2026-10-12T15:30:00');
	});

	it('formatMonth formats current or target month', () => {
		expect(formatMonth('2026-05-18')).toBe('2026-05');
		expect(formatMonth()).toMatch(/^\d{4}-\d{2}$/);
	});

	it('formatDayjs returns Dayjs instance for value or current time if null/undefined', () => {
		const parsed = formatDayjs('2026-10-12');
		expect(parsed.format('YYYY-MM-DD')).toBe('2026-10-12');
		const now = formatDayjs();
		expect(now.isValid()).toBe(true);
	});

	it('nowDayjs returns valid current Dayjs instance', () => {
		const now = nowDayjs();
		expect(now.isValid()).toBe(true);
	});

	it('getMonthRange returns tuple of [startOfMonth, endOfMonth]', () => {
		const [start, end] = getMonthRange('2026-02-15');
		expect(start).toBe('2026-02-01');
		expect(end).toBe('2026-02-28');

		const [leapStart, leapEnd] = getMonthRange('2024-02-15');
		expect(leapStart).toBe('2024-02-01');
		expect(leapEnd).toBe('2024-02-29');

		const [currStart, currEnd] = getMonthRange();
		expect(currStart).toMatch(/^\d{4}-\d{2}-01$/);
		expect(currEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it('getMonthRangeDayjs returns Dayjs tuple for presets', () => {
		const [startDayjs, endDayjs] = getMonthRangeDayjs('2026-10-12');
		expect(startDayjs.format('YYYY-MM-DD')).toBe('2026-10-01');
		expect(endDayjs.format('YYYY-MM-DD')).toBe('2026-10-31');
	});
});
