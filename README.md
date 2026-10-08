<h1 align="center">Alex Miaosha Mobile</h1>

<p align="center">
  <b>📱 基于 Vue 3.5 + Vite 8 + Vant 4 + pnpm 的现代化移动端业务中台</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js" alt="vue" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite" alt="vite" />
  <img src="https://img.shields.io/badge/Vant-4.x-1989FA?style=flat-square&logo=vant" alt="vant" />
  <img src="https://img.shields.io/badge/Pinia-3.x-F6C343?style=flat-square&logo=vue.js" alt="pinia" />
  <img src="https://img.shields.io/badge/pnpm-12.x-F69220?style=flat-square&logo=pnpm" alt="pnpm" />
  <img src="https://img.shields.io/badge/ECharts-6.x-AA344D?style=flat-square&logo=echarts" alt="echarts" />
  <img src="https://img.shields.io/github/license/AlexhahahaDrag/alex_miaosha_mobile?style=flat-square&color=22C55E" alt="license" />
</p>

---

## 📖 项目简介

`alex_miaosha_mobile` 是 Alex 微服务管理体系下的移动端应用，融合了 **电商秒杀抢购** 与 **礼尚往来智能人情记账** 两大核心业务场景。重点关注：

- 🚀 **移动端专属交互体验**：移动优先适配、骨架屏渐进加载、下拉刷新与触觉反馈（Haptic Vibration）。
- 🤖 **移动端 AI 快捷记账**：支持自然语言文本与语音录入，通过 AI 智能解析一键自动提取人名、事由、金额与流向。
- 🌓 **深色暗黑模式 (Dark Mode)**：内置 Theme Store，支持深浅色主题无缝切换与系统偏好自适应。
- 📊 **移动可视化看盘**：集成 ECharts 6.x 移动端轻量图表，随时掌握人情收支与月度趋势。
- 🧪 **AI 驱动端到端测试**：集成 Midscene + Playwright 移动端 AI 自动化冒烟测试套件。

---

## ✨ 核心亮点

- 📱 **移动端优先规范**：基于 `Vant 4` 组件库，针对主流全面屏尺寸（默认 390×844 视口）进行像素级调优。
- 🤖 **智能记礼与还礼建议**：
  - **自然语言解析**：输入“上周末张三婚礼随礼800元”，自动解析并填充录单字段。
  - **动态测算推荐**：提供 4 档智能推荐金额及进位提示，还礼心中有数。
- 📳 **触觉微反馈 (Haptic)**：集成 `navigator.vibrate` 微震动探针，在核心点击、记账成功和回礼确认时提供细腻振动反馈。
- 🌓 **全场景暗黑模式**：深色调主题深度适配，夜间使用护眼沉浸。
- 📦 **高性能工程化基底**：全面基于 `pnpm@12.4.2`、严格 TypeScript 类型校验、Day.js 日期工具封装与 ESLint/Prettier/Husky 规范保障。

---

## 🛠️ 技术栈

| 层次 | 选型技术 | 核心作用 |
| :--- | :--- | :--- |
| **视图层** | `Vue 3.5` + `Vue Router 5` | 响应式 Composition API、路由解耦与转场过渡 |
| **构建链** | `Vite 8` + `@rollup/plugin-terser` | 极速冷启动、HMR 热重载与体积压缩 |
| **UI 组件** | `Vant 4.9+` | 移动端交互基石，丰富的触控组件支持 |
| **状态仓库** | `Pinia 3.x` + `persistedstate` | 用户态、暗黑主题、最近联系人/事由本地持久化 |
| **网络请求** | `Axios 1.x` + `crypto-es` | 统一请求封装、Token 鉴权、敏感参数加解密 |
| **图表计算** | `ECharts 6.x` + `decimal.js` | 移动端报表渲染与高精度财务金额计算 |
| **自动化测试** | `@midscene/web` + `@playwright/test` | AI 视觉理解驱动的移动端冒烟测试与触觉断言 |

---

## 🏗️ 目录结构

```text
alex_miaosha_mobile/
├── 🎯 src/
│   ├── 📡 api/             # 业务接口定义 (按 user/finance/gift 等模块拆分)
│   ├── 🎨 assets/          # 静态资源与移动端图标
│   ├── 🧩 components/      # 移动端通用业务组件 (AI 记礼浮窗、金额输入盘等)
│   ├── 🪝 composables/     # 组合式函数 (暗黑主题、下拉刷新、触觉反馈)
│   ├── 🧭 router/          # 移动端路由配置与导航守卫
│   ├── 🗃️ stores/          # Pinia 状态仓库 (user, theme, gift)
│   ├── 🛠️ utils/           # 通用工具库 (dayjs 时间处理、金额格式化、振动探针)
│   └── 📄 views/           # 页面模块
│       ├── home/           # 移动端综合首页与功能导航
│       ├── finance/gift/   # 礼尚往来移动端全流程 (dashboard/person/event/record/analysis)
│       ├── seckill/        # 电商秒杀与商品抢购
│       ├── user/           # 个人中心、主题设置与安全管理
│       └── login/          # 移动端认证与登录
├── 🧪 tests/               # 自动化测试用例
│   └── midscene/gift/      # 移动端 AI 冒烟用例与断言
├── 📜 scripts/             # Playwright/Midscene 自动化执行脚本
└── 📋 package.json         # pnpm 依赖配置与任务指令
```

---

## 🎁 移动端礼尚往来记账体系

移动端在 `src/views/finance/gift/` 下构建了极致流畅的记账体验，功能与管理端完全闭环对齐：

1. 📊 **数据概览 (`dashboard`)**：收支卡片、待还人情小红点、近期往来趋势柱状图。
2. 👥 **亲友管理 (`person`)**：亲友列表、按关系分类（亲戚/同学/同事/朋友）、人情往来账本。
3. 🏷️ **事由管理 (`event`)**：常用事由快捷选择（婚宴、满月、寿宴等）、新建与历史事件。
4. 📝 **礼金记录 (`record`)**：
   - **一键 AI 记礼**：点击顶部 AI 助手，自然语言一句话自动填单。
   - **极简极速录入**：最近联系人、快捷事由与预设推荐金额一键点选。
   - **回礼闭环**：支持关联原收礼记录，自动冲减待还金额。
5. 📈 **统计分析 (`analysis`)**：移动端图表展示，支持按年度、分类与亲疏度筛选。

---

## 🚀 快速开始

### 环境准备

- **Node.js**：`>= 18.0.0` (推荐 LTS)
- **包管理器**：**pnpm** `>= 9.0.0`

### 1. 安装依赖

```bash
# 克隆仓库
git clone https://github.com/AlexhahahaDrag/alex_miaosha_mobile.git

# 进入项目目录
cd alex_miaosha_mobile

# 使用 pnpm 安装依赖
pnpm install
```

### 2. 运行与开发

```bash
# 启动本地开发服务 (支持移动端热重载)
pnpm dev

# 以测试环境配置运行
pnpm test

# 生产模式本地运行
pnpm prod
```

### 3. 构建与产物预览

```bash
# 构建测试环境
pnpm build:test

# 构建生产环境
pnpm build:prod

# 预览打包产物
pnpm preview
```

---

## 🧪 自动化测试套件

移动端集成了基于 **Midscene + Playwright** 的 AI 自动化测试方案，涵盖 390×844 手机视口模拟与 `navigator.vibrate` 触觉探针断言：

```bash
# 运行移动端 AI 冒烟测试
pnpm test:ai:smoke

# 本地执行礼尚往来移动端自动化冒烟测试
pnpm test:midscene:gift:local

# 运行单元测试
pnpm test:unit

# 代码质量检查与修复
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
```

---

## 🔧 移动端开发规约

- **ID 精度保护**：所有由后端传递的 `Long` 类型主键（`personId`, `recordId`, `eventId` 等），移动端一律维持为 `string` 字符串类型处理，严禁在前端使用 `Number()` 转换。
- **日期处理**：优先引入并使用 `@/utils/dayjs/index.ts` 中封装好的工具函数，统一展示格式为 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm`。
- **导航栏配置**：导航栏响应式配置推荐统一遵循 `const info = ref<Pick<NavBarConfig, 'title' | 'rightButton' | 'leftPath'>>(...)` 的标准化范式。
- **触觉与动效**：在涉及保存、删除、状态变更的关键交互节点，推荐调用振动触觉工具增强物理反馈质感。

---

## 🔗 相关项目

- 📦 **后端微服务仓库**：[AlexhahahaDrag/alex_miaosha](https://github.com/AlexhahahaDrag/alex_miaosha)
- 🎨 **PC 前端仓库**：[AlexhahahaDrag/alex_miaosha_front](https://github.com/AlexhahahaDrag/alex_miaosha_front)

---

## 📄 许可证

本项目采用 MIT 许可证 - 详情参见 [LICENSE](LICENSE)。
