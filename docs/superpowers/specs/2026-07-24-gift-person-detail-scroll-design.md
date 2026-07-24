# 短内容页无意义 Y 轴滚动条修复设计

日期：2026-07-24  
范围：移动端 layout 内容区 + 同类 `min-height: 100%` 页面根节点  
方案：页面侧统一（方案 1）

## 1. 问题

「新增联系人」(`giftPersonDetail` 表单模式) 字段很少，仍出现 Y 轴滚动条，底部大量空白可滚。

## 2. 根因

1. 全局 layout（`src/layouts/index.vue`）中 `.content-container` 为唯一滚动容器：

```css
.content-container {
  flex: 1;
  overflow-y: auto;
  height: 0; /* flex 子项高度约束 */
}
```

2. `giftPersonDetail` 根节点同时存在：

```css
.gift-person-detail {
  min-height: 100%;
  padding: 16px;
  /* 无 box-sizing: border-box */
}
```

3. 默认 `content-box` 下，`min-height: 100%` 只约束 content box，再叠加上下 padding，总高度 = 父高 + 32px，即使业务内容很短也会触发父容器滚动。

## 3. 非目标

- 不改 layout 滚动契约（列表 / 下拉刷新依赖 `.content-container`）。
- 不引入全局 `* { box-sizing: border-box }`（回归面过大）。
- 不改 `cpn-user-coupon-info` 内部 list 的 `min-height`（非 layout 内容根）。

## 4. 修复规则

页面根节点：

| 条件 | 处理 |
|---|---|
| 需要背景铺满 + 有垂直 padding | 保留 `min-height: 100%`，补 `box-sizing: border-box` |
| 不需要背景铺满 | 删除 `min-height: 100%` |

## 5. 改动清单

| 文件 | 处理 |
|---|---|
| `src/views/finance/gift/person/giftPersonDetail/index.vue` | `border-box`（当前 bug） |
| `src/views/finance/gift/analysis/index.vue` | `border-box` |
| `src/views/finance/financeAnalysis/financeAnalysisDetail/overview.vue` | `border-box` |
| `src/views/finance/financeAnalysis/financeAnalysisDetail/incomeAnalysis.vue` | `border-box` |
| `src/views/finance/financeAnalysis/financeAnalysisDetail/incomeDetail.vue` | `border-box` |
| `src/views/finance/shopStockBatch/shopStockBatchDetail/index.vue` | `border-box`（含 `padding-bottom: 40px`） |
| `src/views/selfFinance/prepaidCardInfoT/consume-overview-info/index.vue` | 按规则补 `border-box` 或删 `min-height` |
| `DEVELOPMENT.md` | 补一条根节点约束说明 |

## 6. 验收

1. 新增联系人短表单：`.content-container.scrollHeight <= clientHeight`，无 Y 滚动条。
2. 同页内容变长（长备注 / profile 多条历史）仍可正常滚动。
3. 抽检 `gift/analysis`、任一 `financeAnalysisDetail`、`shopStockBatchDetail` 短内容时无空滚。

## 7. 测试策略

- 纯 CSS 布局问题，不强制单测 / E2E。
- 开发自测按 §6 三条验收；可选 Midscene smoke，本次不做强制。

## 8. 风险

- 仅改 `box-sizing`，视觉布局变化极小；若某页曾依赖「content-box 额外撑高」制造滚动空间，改后空白滚消失（即期望行为）。
