import { createApp } from 'vue';
import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';
import 'vant/es/toast/style';
import 'vant/lib/index.css';
import 'virtual:svg-icons-register';
import App from './App.vue';
import router from '@/router/index';
import { setupStore } from '@/store';
import '@/assets/styles/variables.css';

const app = createApp(App);
app.use(Particles, {
	init: async (engine) => {
		await loadSlim(engine);
	},
});
app.use(router).mount('#app');
setupStore(app);
