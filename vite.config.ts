import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path";
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

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
    }),
    createSvgIconsPlugin({
      iconDirs: [
        pathResolve('/src/icons/menu'), 
        pathResolve('/src/icons/finance'), 
        pathResolve('/src/icons/soft'),
        pathResolve('src/icons')
      ],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',//body-last|body-first默认body-last
      customDomId: '__svg__icons__dom__', //默认__svg__icons__dom__
    }),
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
    host: '0.0.0.0',
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
