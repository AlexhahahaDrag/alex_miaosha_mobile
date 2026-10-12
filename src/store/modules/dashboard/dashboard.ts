import { defineStore } from 'pinia';
import { formatTime } from '@/utils/dayjs';
import { piniaPersistConfig } from '@/config/piniaPersist';

interface DashboardState {
	lastSaveTimes: Record<string, string>;
}

export const useDashboardStore = defineStore('app-dashboard', {
	state: (): DashboardState => ({
		lastSaveTimes: {},
	}),

	getters: {
		getLastSaveTimes(state): Record<string, string> {
			return state.lastSaveTimes;
		},
	},

	actions: {
		updateSaveTime(moduleTitle: string, time?: string) {
			const timestamp = time || formatTime();
			this.lastSaveTimes[moduleTitle] = timestamp;
		},

		clearSaveTimes() {
			this.lastSaveTimes = {};
		},
	},

	persist: piniaPersistConfig('app-dashboard'),
});
