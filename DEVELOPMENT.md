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

---

## 5. 「开发/架构层面」双向同步协议

> [!IMPORTANT]
> **凡涉及全局交互体系、基础设施、或 `src/views/components` 的结构性更改，Antigravity 必须自觉检查并更新本 `DEVELOPMENT.md` 文件。**
> _业务逻辑、接口映射和变量挂载的变动则维持此前对 `FEATURE.md` 的检查协议。_
