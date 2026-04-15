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

所有具备业务无关性、可在多场景通用的独立封装组件将存放在 `src/components/` 目录下。

### 📌 `CommonPullRefresh.vue` (公共下拉刷新组件)
- **位置**: `src/components/CommonPullRefresh.vue`
- **功能设计**: 
  基于 Vant 的 `<van-pull-refresh>` 进行了深层封装。预先锁定了符合该系统调性的刷新文本（如「松开以刷新...」、「努力加载中...」），通过继承 `$attrs` 并利用双向绑定抛出状态。
- **使用样例**:
  ```vue
  <CommonPullRefresh class="list-wrapper" v-model="isRefresh" @refresh="onRefreshData">
      <van-list>...</van-list>
  </CommonPullRefresh>
  ```
- **同步原则**: 凡具有全局控制下拉阈值与样式变更诉求的，统一收束在该组件内维护。

---

## 3. 「开发/架构层面」双向同步协议 

> [!IMPORTANT]
> **凡涉及全局交互体系、基础设施、或 `src/components` 的结构性更改，Antigravity 必须自觉检查并更新本 `DEVELOPMENT.md` 文件。** 
> *业务逻辑、接口映射和变量挂载的变动则维持此前对 `FEATURE.md` 的检查协议。*
