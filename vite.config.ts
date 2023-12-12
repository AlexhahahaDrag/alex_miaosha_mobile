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
  build: {
    chunkSizeWarningLimit: 1000, // 调整包的大小
    rollupOptions: {
      output: {
        // 最小化拆分包
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        },
        // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
        entryFileNames: 'assets/js/[name].[hash].js', // 用于命名代码拆分时创建的共享块的输出命名
        chunkFileNames: 'assets/js/[name].[hash].js', // 用于输出静态资源的命名，[ext]表示文件扩展名
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]'
      }
    }
  },
})
