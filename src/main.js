import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router/index.ts';
import 'vant/es/toast/style'
import { setupStore } from "@/store";

const app = createApp(App);
app.use(router).mount('#app')
setupStore(app);
