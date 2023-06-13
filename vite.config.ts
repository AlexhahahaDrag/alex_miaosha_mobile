import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path";
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

const pathResolve = (dir: string): any => {
  return resolve(__dirname, "./", dir);
};

const alias: Record<string, string> = {
  "@": pathResolve("src"),
  "@v": pathResolve("src/views"),
  "@u": pathResolve("src/utils"),
  "@a": pathResolve("src/api"),
  "@r": pathResolve("src/router"),
};

export default defineConfig({
  plugins: [vue(),
    Components({
      resolvers: [VantResolver()]
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
   },
  },
  resolve: {
    alias: alias,
  },
  server: {
    // host: '10.10.20.38',
    // port: VITE_PORT,
    port: 2000,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:30001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
