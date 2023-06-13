import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router/index.ts';
import 'vant/es/toast/style'

createApp(App).use(router).mount('#app')
