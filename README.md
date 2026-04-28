<h1 align="center">Alex Miaosha Mobile</h1>

<p align="center">
  <b>基于 Vue 3 + Vite 的移动端秒杀前端项目</b>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/AlexhahahaDrag/alex_miaosha_mobile?style=for-the-badge&logo=github&color=7C3AED" alt="stars" />
  <img src="https://img.shields.io/github/forks/AlexhahahaDrag/alex_miaosha_mobile?style=for-the-badge&logo=github&color=06B6D4" alt="forks" />
  <img src="https://img.shields.io/github/license/AlexhahahaDrag/alex_miaosha_mobile?style=for-the-badge&color=22C55E" alt="license" />
  <img src="https://img.shields.io/github/last-commit/AlexhahahaDrag/alex_miaosha_mobile?style=for-the-badge&logo=git&color=F59E0B" alt="last commit" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js" alt="vue" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite" alt="vite" />
  <img src="https://img.shields.io/badge/Vant-4.x-1989FA?style=flat-square" alt="vant" />
  <img src="https://img.shields.io/badge/Pinia-3.x-F6C343?style=flat-square" alt="pinia" />
  <img src="https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square" alt="axios" />
  <img src="https://img.shields.io/badge/ECharts-6.x-AA344D?style=flat-square" alt="echarts" />
</p>

---

## 项目简介

`alex_miaosha_mobile` 是一个移动端电商秒杀场景项目，重点关注：

- 流畅的移动端交互体验
- 清晰可维护的工程结构
- 多环境运行与构建能力
- 状态持久化与接口数据管理

## 项目亮点

- 移动端优先：基于 `Vant` 的组件体系，适配主流手机尺寸。
- 工程化规范：`ESLint` + `Prettier` + `husky` + `lint-staged` 保障代码质量。
- 状态管理清晰：`Pinia` + `pinia-plugin-persistedstate` 管理全局与持久化状态。
- 构建模式完善：支持 `dev / test / prod` 三种模式。
- 扩展能力强：已集成 `ECharts`，方便后续接入运营与数据可视化。

## 技术栈

- 核心框架：`Vue 3.5`、`Vue Router 5`
- 构建工具：`Vite 8`
- UI 组件：`Vant 4`
- 状态管理：`Pinia`
- 网络请求：`Axios`
- 可视化：`ECharts 6`
- 工具链：`ESLint`、`Prettier`、`TypeScript`

## 线上预览

> 当前未配置公开演示地址。  
> 部署后可在此补充：`https://your-demo-url.example.com`

## GitHub 统计

<p align="center">
  <img height="170" src="https://github-readme-stats.vercel.app/api?username=AlexhahahaDrag&show_icons=true&theme=tokyonight&hide_border=true&count_private=true" alt="GitHub stats" />
  <img height="170" src="https://github-readme-stats.vercel.app/api/top-langs/?username=AlexhahahaDrag&layout=compact&theme=tokyonight&hide_border=true" alt="Top langs" />
</p>

<p align="center">
  <img src="https://streak-stats.demolab.com?user=AlexhahahaDrag&theme=tokyonight&hide_border=true" alt="GitHub streak" />
</p>

<p align="center">
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=AlexhahahaDrag&theme=tokyo-night&hide_border=true" alt="GitHub activity graph" />
</p>

## 快速开始

### 环境要求

- `Node.js` >= 18（推荐 LTS）
- `npm` >= 9

### 安装依赖

```bash
npm install
```

### 本地运行

```bash
npm run dev
```

## 常用命令

```bash
# 开发环境
npm run dev

# 测试模式运行
npm run test

# 生产模式运行
npm run prod

# 构建
npm run build
npm run build:test
npm run build:prod

# 本地预览构建产物
npm run preview

# 代码检查与修复
npm run lint
npm run lint:fix

# 代码格式化
npm run format
npm run format:check
```

## 项目结构

```text
alex_miaosha_mobile
├─ src
│  ├─ api            # 接口定义与请求封装
│  ├─ views          # 页面模块
│  ├─ components     # 通用组件
│  ├─ composables    # 组合式 hooks
│  ├─ stores         # Pinia 状态仓库
│  └─ router         # 路由配置
├─ public            # 静态资源
└─ scripts           # 构建与辅助脚本
```

## 截图预览

> 当前仓库暂未提交页面截图。  
> 建议后续补充：首页、商品详情、秒杀流程、订单列表、个人中心。

## 开发建议

- 提交前建议执行：`npm run lint && npm run format:check`
- 功能分支命名建议：`feat/*`、`fix/*`、`refactor/*`
- 推荐按模块组织页面与状态，保持业务边界清晰

## Roadmap

- [ ] 补充页面截图和核心交互 GIF
- [ ] 增加线上演示地址
- [ ] 输出接口文档与业务流程说明
- [ ] 补充单元测试与 E2E 冒烟测试