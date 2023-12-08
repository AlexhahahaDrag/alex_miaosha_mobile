import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router/index';
import 'vant/es/toast/style'
import { setupStore } from "@/store";
import Particles from "particles.vue3";
import touch from 'vue-directive-touch';

const app = createApp(App);
app.use(router).use(Particles).use(touch).mount('#app')
setupStore(app);
