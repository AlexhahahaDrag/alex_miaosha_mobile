import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router/index';
import 'vant/es/toast/style'
import { setupStore } from "@/store";
import Particles from "particles.vue3";

const app = createApp(App);
app.use(router).use(Particles).mount('#app')
setupStore(app);
