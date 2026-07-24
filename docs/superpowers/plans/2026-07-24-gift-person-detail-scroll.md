# Short-content Y-scrollbar Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 消除短内容页因 `min-height: 100%` + padding（content-box）导致的无意义 Y 轴滚动条。

**Architecture:** 不动 `layouts/index.vue` 的滚动契约；对需要背景铺满的页面根节点补 `box-sizing: border-box`，使 `min-height: 100%` 包含 padding。

**Tech Stack:** Vue 3 SFC + Less scoped；手动 DevTools 验收（纯 CSS，无单测）。

## Global Constraints

- 禁止修改 `src/layouts/index.vue` 的 `.content-container` 滚动策略。
- 页面根节点若同时有 `min-height: 100%` + 垂直 padding，必须 `box-sizing: border-box`。
- 不引入全局 `* { box-sizing: border-box }`。
- 不改 `cpn-user-coupon-info` 内部 list 的 `min-height`。
- 修改 `src` 后运行 `npm run graphify:update`。
- 提交信息勿带 `Co-authored-by: Cursor`；Windows 下避免中文乱码（英文 commit message）。

---

## File Map

| File | Responsibility |
|---|---|
| `src/views/finance/gift/person/giftPersonDetail/index.vue` | 当前 bug 页：根节点补 border-box |
| `src/views/finance/gift/analysis/index.vue` | 同类根节点 |
| `src/views/finance/financeAnalysis/financeAnalysisDetail/overview.vue` | 同类根节点 |
| `src/views/finance/financeAnalysis/financeAnalysisDetail/incomeAnalysis.vue` | 同类根节点 |
| `src/views/finance/financeAnalysis/financeAnalysisDetail/incomeDetail.vue` | 同类根节点 |
| `src/views/finance/shopStockBatch/shopStockBatchDetail/index.vue` | 同类根节点（padding-bottom） |
| `src/views/selfFinance/prepaidCardInfoT/consume-overview-info/index.vue` | 同类根节点（padding 上下） |
| `DEVELOPMENT.md` | 记录根节点约束 |

---

### Task 1: Fix giftPersonDetail (primary bug)

**Files:**
- Modify: `src/views/finance/gift/person/giftPersonDetail/index.vue` (`.gift-person-detail` style block)
- Test: manual DevTools on 新增联系人

**Interfaces:**
- Consumes: none
- Produces: `.gift-person-detail` uses `box-sizing: border-box`

- [ ] **Step 1: Apply border-box on page root**

将：

```less
.gift-person-detail {
	min-height: 100%;
	padding: 16px;
	background: #f8fbff;
}
```

改为：

```less
.gift-person-detail {
	box-sizing: border-box;
	min-height: 100%;
	padding: 16px;
	background: #f8fbff;
}
```

- [ ] **Step 2: Manual verify short form**

1. 打开「新增联系人」（无 `id` query）。
2. DevTools 选中 `.content-container`。
3. Console：`$0.scrollHeight <= $0.clientHeight` 应为 `true`（无 Y 滚动条）。

Expected: 无空滚；背景仍铺满内容区。

- [ ] **Step 3: Manual verify long content still scrolls**

1. 备注输入多行，或打开有多条往来历史的联系人详情。
2. `.content-container` 在内容超出时可滚动。

Expected: 长内容仍可滚。

- [ ] **Step 4: Commit**

```bash
git add src/views/finance/gift/person/giftPersonDetail/index.vue
git commit -m "fix(gift): prevent empty Y-scroll on person detail form"
```

---

### Task 2: Fix remaining same-pattern page roots

**Files:**
- Modify: `src/views/finance/gift/analysis/index.vue` (`.gift-analysis`)
- Modify: `src/views/finance/financeAnalysis/financeAnalysisDetail/overview.vue` (`.overview-container`)
- Modify: `src/views/finance/financeAnalysis/financeAnalysisDetail/incomeAnalysis.vue` (`.analysis-container`)
- Modify: `src/views/finance/financeAnalysis/financeAnalysisDetail/incomeDetail.vue` (`.income-detail`)
- Modify: `src/views/finance/shopStockBatch/shopStockBatchDetail/index.vue` (`.shop-stock-batch-detail-container`)
- Modify: `src/views/selfFinance/prepaidCardInfoT/consume-overview-info/index.vue` (`.consume-overview-container`)

**Interfaces:**
- Consumes: Task 1 确认的规则（`min-height: 100%` + padding → `border-box`）
- Produces: 上述根 class 均含 `box-sizing: border-box`

- [ ] **Step 1: Patch gift analysis**

```less
.gift-analysis {
	box-sizing: border-box;
	min-height: 100%;
	padding: 14px;
	background: #f8fbff;
}
```

- [ ] **Step 2: Patch financeAnalysisDetail trio**

```less
.overview-container {
	box-sizing: border-box;
	padding: 16px;
	background-color: #f7f8fa;
	min-height: 100%;
}
```

```less
.analysis-container {
	box-sizing: border-box;
	padding: 10px;
	background-color: #f5f7fa;
	min-height: 100%;
	/* ...existing nested rules unchanged... */
}
```

```less
.income-detail {
	box-sizing: border-box;
	padding: 16px;
	background-color: #f5f7fa;
	min-height: 100%;
	/* ...existing nested rules unchanged... */
}
```

- [ ] **Step 3: Patch shopStockBatchDetail**

```less
.shop-stock-batch-detail-container {
	box-sizing: border-box;
	min-height: 100%;
	background-color: #f8fafc;
	padding-bottom: 40px;
}
```

- [ ] **Step 4: Patch consume-overview-info**

```less
.consume-overview-container {
	box-sizing: border-box;
	background: #f9fafb;
	min-height: 100%;
	padding: 16px 0 72px; // 预留底部 Tabbar 高度
}
```

- [ ] **Step 5: Spot-check short content**

抽检：`gift/analysis`、任一 `financeAnalysisDetail`、`shopStockBatchDetail`。短内容时 `.content-container` 无空滚。

- [ ] **Step 6: Commit**

```bash
git add \
  src/views/finance/gift/analysis/index.vue \
  src/views/finance/financeAnalysis/financeAnalysisDetail/overview.vue \
  src/views/finance/financeAnalysis/financeAnalysisDetail/incomeAnalysis.vue \
  src/views/finance/financeAnalysis/financeAnalysisDetail/incomeDetail.vue \
  src/views/finance/shopStockBatch/shopStockBatchDetail/index.vue \
  src/views/selfFinance/prepaidCardInfoT/consume-overview-info/index.vue
git commit -m "fix(ui): border-box page roots to stop empty Y-scroll"
```

---

### Task 3: Document constraint + graphify

**Files:**
- Modify: `DEVELOPMENT.md`（§1 全局 UI 架构附近新增一条）
- Run: `npm run graphify:update`

**Interfaces:**
- Consumes: §4 修复规则（spec）
- Produces: DEVELOPMENT.md 约束条文

- [ ] **Step 1: Add DEVELOPMENT.md note**

在 `## 1. 全局 UI 架构与视觉标准` 列表末尾追加：

```markdown
- **页面根节点高度**：挂在 layout `.content-container` 下的页面根节点若同时使用 `min-height: 100%` 与垂直 `padding`，必须设置 `box-sizing: border-box`，避免 content-box 下 padding 把总高度撑出无意义 Y 轴滚动条。不要改 layout 的 `overflow-y: auto` 契约。
```

- [ ] **Step 2: Update graphify**

```bash
npm run graphify:update
```

Expected: 命令成功退出（AST-only）。

- [ ] **Step 3: Commit**

```bash
git add DEVELOPMENT.md src/graphify-out
git commit -m "docs: note min-height+padding requires border-box on page roots"
```

---

## Spec Coverage Checklist

| Spec item | Task |
|---|---|
| 不动 layout 滚动契约 | Global Constraints + 无 layout 改动任务 |
| giftPersonDetail border-box | Task 1 |
| gift/analysis + financeAnalysisDetail + shopStockBatchDetail + consume-overview | Task 2 |
| 排除 cpn-user-coupon-info | Global Constraints |
| 验收短内容无滚 / 长内容可滚 | Task 1 Step 2–3, Task 2 Step 5 |
| DEVELOPMENT.md 约束 | Task 3 |
| 无强制 E2E | 全计划仅手动验收 |
