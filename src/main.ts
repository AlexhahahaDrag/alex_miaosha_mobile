import { createApp } from 'vue';
import 'vant/es/toast/style';
import 'vant/lib/index.css';
import 'virtual:svg-icons-register';
import App from './App.vue';
import router from '@/router/index';
import { setupStore } from '@/store';
import '@/assets/styles/variables.css';

const app = createApp(App);

setupStore(app);

app.use(router);

void router.isReady().then(() => {
	app.mount('#app');
});
