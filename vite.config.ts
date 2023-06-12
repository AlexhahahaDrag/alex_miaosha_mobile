import { fileURLToPath, URL } from 'node:url'

import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers"
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { resolve } from "path";
import { createStyleImportPlugin, VantResolve } from 'vite-plugin-style-import';
import { getThemeVariables } from 'ant-design-vue/dist/theme';

const pathResolve = (dir: string): any => {
  return resolve(__dirname, "./", dir);
};

const alias: Record<string, string> = {
  "@": fileURLToPath(new URL('./src', import.meta.url)),
  "@v": fileURLToPath(new URL('./src/views', import.meta.url)),
  "@u": fileURLToPath(new URL('./src/utils', import.meta.url)),
  "@a": fileURLToPath(new URL('./src/api', import.meta.url)),
  "@r": fileURLToPath(new URL('./src/router', import.meta.url)),
};

export default defineConfig({
  plugins: [vue(),
  Components({
    resolvers: [
      AntDesignVueResolver({
        importStyle: 'less',
      }),
    ],
  }),
  createSvgIconsPlugin({
    iconDirs: [pathResolve('src/icons/menu'), pathResolve('src/icons/finance'), pathResolve('src/icons/soft'), pathResolve('src/icons')],
    symbolId: 'icon-[dir]-[name]',
    inject: 'body-last',//body-last|body-first默认body-last
    customDomId: '__svg__icons__dom__', //默认__svg__icons__dom__
  }),
  createStyleImportPlugin({
    resolves: [VantResolve()],
    libs: [
      {
        libraryName: 'vant',
        esModule: true,
        resolveStyle: (name) => {
          return `../es/${name}/style/index`;
        },
      },
    ],
  }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: { ...getThemeVariables() },
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
