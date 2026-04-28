import { defineStore } from 'pinia';
import dayjs from 'dayjs';
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
			const timestamp = time || dayjs().format('YYYY-MM-DD HH:mm:ss');
			this.lastSaveTimes[moduleTitle] = timestamp;
		},

		clearSaveTimes() {
			this.lastSaveTimes = {};
		},
	},

	persist: piniaPersistConfig('app-dashboard'),
});
