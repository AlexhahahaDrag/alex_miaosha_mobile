import { createApp } from 'vue';
import particles from 'particles.vue3';
import 'vant/es/toast/style';
import 'vant/lib/index.css';
import 'virtual:svg-icons-register';
import App from './App.vue';
import router from '@/router/index';
import { setupStore } from '@/store';
import '@/assets/styles/variables.css';

const app = createApp(App);
app.use(router).use(particles).mount('#app');
setupStore(app);
