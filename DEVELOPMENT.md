# Alex Miaosha Mobile - 开发与底层技术规范指南 (DEVELOPMENT.md)

> **定位声明**：本文件专注于记录项目的**非业务级代码约定**、**公共组件架构**与**全局 UI 技术规范**。关于核心业务流、API关联及功能模块的状态流转等业务逻辑，请统一查阅 [FEATURE.md](./feature.md)。

---

## 1. 全局 UI 架构与视觉标准

根据当前移动端设计趋势及前序优化工作，项目中所有的 UI 改造与新组件开发需遵循以下基准：

- **组件视觉形态 (Visual Hierarchy)**：
  - 推崇“去线留白”。顶部搜索与下拉导航尽量去除底部边界阴影。
  - 核心内容实施**卡片化布局**，圆角基准统一提高为 `16px`。
  - 为防止长列表显得拥挤，列表容器需保持适当侧边距（推荐 `padding: 0 16px`）。

- **交互体验 (Interaction & Haptics)**：
  - **触觉反馈 (Haptic)**：在关键业务按钮（提交、删除、列表卡片点击跳转）中，若浏览器支持，需通过 `navigator.vibrate?.(50)` 注入触力动效震动以增强点击确定感。
  - **原生手势兼容**：卡片通过 `active` 状态缩放 (`transform: scale(0.98)`) 拟合原生级按压动效。

- **加载与感知 (Performance)**：
  - 加载占位符首推骨架屏（Skeleton Screen，如 `<van-skeleton>`）而非空洞的 Loading 文本组件，以缓和首屏/列表下发时的加载焦虑。
  - 空状态应统一使用插画友好提示补充，替换原本默认的“暂无数据”。

- **页面根节点高度**：挂在 layout `.content-container` 下的页面根节点若同时使用 `min-height: 100%` 与垂直 `padding`，必须设置 `box-sizing: border-box`，避免 content-box 下 padding 把总高度撑出无意义 Y 轴滚动条。不要改 layout 的 `overflow-y: auto` 契约。

---

## 2. 公共基础组件目录 (Common Components)

所有具备业务无关性、可在多场景通用的独立封装组件将存放在 `src/views/components/` 目录下。

### 📌 `CommonPullRefresh.vue` (公共下拉刷新容器)

- **位置**: `src/views/components/CommonPullRefresh.vue`
- **功能设计**:
  对 `van-pull-refresh` 的轻量级封装。它不再主动关联列表状态，仅负责手势拦截。
- **使用建议**:
  通常作为 `CommonList.vue` 的外层容器使用。

### 📌 `CommonList.vue` (公共列表状态组件)

- **位置**: `src/views/components/CommonList.vue`
- **功能设计**:
  专门负责列表状态切换的 UI 组件，集成了骨架屏（Skeleton）、空状态（Empty）显示以及 `van-list` 的逻辑。
- **使用样例**:
  ```vue
  <CommonPullRefresh v-model="isRefresh" @refresh="onRefresh">
      <CommonList 
          v-model="loading"
          :loading="loading"
          :refreshing="isRefresh"
          :finished="finished"
          :isEmpty="dataSource.length === 0"
          @load="onLoadMore"
      >
          <div v-for="item in dataSource">...</div>
      </CommonList>
  </CommonPullRefresh>
  ```
- **同步原则**: 凡具有全局控制下拉阈值与样式变更诉求的，统一收束在该组件内维护。

---

## 3. 公共 Hooks (Composables) 规范

所有跨组件复用的组合式函数统一存放在 `src/composables/` 目录下。

### 📌 `usePagination.ts` (标准化分页管理)

- **位置**: `src/composables/usePagination.ts`
- **功能设计**:
  统一接管所有列表分页数据的状态（当前页码、总数据量）控制，并提供标准的状态变动方法，抛弃传统各个业务组件内独立 `ref({ current: 1, pageSize: 10, total: 0 })` 的重复模板。
- **使用样例**:

  ```ts
  import { usePagination } from '@/composables/usePagination';

  const { pagination, resetPagination, setTotal, nextPage } = usePagination();
  const finished = ref(false);

  // 初始化或重新搜索时：
  resetPagination(); // 重置 current=1, total=0

  // 接口请求成功时：
  setTotal(data.total); // 更新总数
  nextPage(); // 自动将页码推移至下一页准备

  // 原则：判定当总数 <= 当前列表长度时即完成
  finished.value = (pagination.total || 0) <= dataSource.value.length;
  ```

---

## 4. Vue SFC 代码规范与结构约束

凡在该项目中编写或重构的 Vue 3 组件，必须严格遵循以下结构流转顺序，严禁随意编排。

### 📌 标签块布局顺序 (Top-level Tag Order)

1. `<template>`：HTML 结构。
2. `<script setup lang="ts">`：逻辑处理。
3. `<style scoped>`：组件样式（必须加 `scoped`）。

### 📌 Script 内部声明顺序 (Internal Logic Order)

代码必须按以下模块依次排布：

1. **Imports**：依赖导入。
2. **Constants / Types / API**：静态定义。
3. **useHooks**：路由、Store 等 Hooks 实例化。
4. **Variables**：`ref`, `reactive`, `computed`, `defineProps` 等。
5. **Methods**：业务逻辑函数（`init`/`fetchData` 置于该区底部）。
6. **Lifecycle**：`onMounted` 等生命周期。
7. **Watchers**：`watch` 监听。
8. **Emits**：`defineEmits` 必须作为 Script 区块的最后一行。

- 详细规范内容查阅：[.gemini/skills/vue-coding-standards.md](file:///d:/project/alex_miaosha_mobile/.gemini/skills/vue-coding-standards.md)
- UI/UX 设计增强：[.gemini/skills/ui-ux-pro-max/SKILL.md](file:///d:/project/alex_miaosha_mobile/.gemini/skills/ui-ux-pro-max/SKILL.md) (集成 UI/UX Pro Max 设计智能)

## 6. 「架构与自动导入」技术说明

项目深度集成了 `unplugin-auto-import` 与 `unplugin-vue-components`，这对代码分析与依赖追踪有以下影响：

- **隐式依赖 (Implicit Dependencies)**：
  - Vue 核心 API (`ref`, `computed`, `watch`, `onMounted` 等)、`vue-router` 以及 `pinia` 的常用方法已配置全局自动导入。
  - **重要原则**：严禁在 Vue SFC 中手动导入上述已配置的全局 API。若发现遗留的手动导入，应在重构时予以清除。
- **组件自动解析 (Auto-resolved Components)**：
  - `src/views/components/` 下的公共组件以及 `Vant` 组件库均由插件自动解析。
  - 在分析 `.vue` 文件时，**不能仅通过 `import` 语句判断依赖**，必须同步检查 `<template>` 中的标签（如 `<CommonList>`, `<van-field>`）。
- **类型声明文件**：
  - `components.d.ts` 与 `src/auto-imports.d.ts` 是由构建工具动态生成的，严禁手动修改。

---

## 7. API 调用与响应解构规范

- **统一解构响应**：
  - 所有接口调用在业务代码中应优先使用解构赋值，避免频繁 `res.code` / `res.data` / `res.message` 点取。
  - 推荐写法如下：

  ```ts
  const { code, data, message } = await api();
  ```

- **适用范围**：
  - `async/await` 场景优先使用上述结构。
  - `then` 场景建议尽量重构为 `async/await` 后再统一解构。

---

## 8. 开发/架构层面同步协议 (Sync Protocol)

> [!IMPORTANT]
> **凡涉及全局交互体系、基础设施、或 `src/views/components` 的结构性更改，Antigravity 必须自觉检查并更新本 `DEVELOPMENT.md` 文件。**
> _业务逻辑、接口映射和变量挂载的变动则维持此前对 `FEATURE.md` 的检查协议。_

---

## 9. 礼尚往来移动端页面规范

礼尚往来移动端页面统一放在 `src/views/finance/gift/`，页面顺序必须与管理端和菜单顺序一致：

```text
dashboard -> person -> event -> record -> analysis
```

### 交互规范

- 礼金子模块四主页（亲友/事由/记账/分析）通过 `useTabBar` + `GIFT_TAB_BAR` 替换底栏；详情页 `visible: false`。
- 移动端页面以卡片化布局为主，背景颜色保持浅色、低饱和，避免深色大面积铺底。
- 快速记礼是核心流程，应尽量减少输入步骤，优先提供最近联系人、最近事由和常用金额快捷选择。
- 列表页必须复用 `CommonPullRefresh`、`CommonList` 和 `usePagination`，禁止页面直接使用 `van-pull-refresh` 或自行重复实现分页。
- 加载态使用 Skeleton，空状态使用 Empty，禁止只展示 Loading 文字。
- 新增、保存、标记已回礼等高频操作需要触发 Haptic 反馈。
- 礼金记录与回礼管理不拆页面，通过方向标签、回礼状态、待回金额展示。

### 代码规范

- 共享类型、枚举、配置放在 `src/views/finance/gift/config.ts`（或 `config/`）。
- API 按子域放在 `person/api`、`event/api`、`record/api`（无聚合 barrel）；ID 靠前端 `GiftId=string` + 后端 `Long2StringSerializer`。
- 业务卡片组件放在 `src/views/finance/gift/components/`。
- 页面样式优先复用 `src/views/finance/gift/shared.less`。
- 接口调用统一使用响应解构：`const { code, data, message } = await api()`。
- 按钮权限用 `usePermission().hasPermission`；关系选项用 `useGiftRelationOptions`。

### 亲友管理

- 列表：`/finance/gift/person` → `person/index.vue`（`getGiftPersonBusinessPage` + `getGiftPersonSummary`）。
- 详情：`t_menu_info.name=giftPersonDetail`，path `/finance/gift/person/giftPersonDetail`，组件 `person/giftPersonDetail/index.vue`（档案 / 表单同页）。
- 跳转详情用 `getRoutePathByName(router, 'giftPersonDetail')`，禁止散落硬编码 path。
