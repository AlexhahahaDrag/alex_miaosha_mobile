### Task 2: Fix remaining same-pattern page roots

**Files:**

- Modify: `src/views/finance/gift/analysis/index.vue` (`.gift-analysis`)
- Modify: `src/views/finance/financeAnalysis/financeAnalysisDetail/overview.vue` (`.overview-container`)
- Modify: `src/views/finance/financeAnalysis/financeAnalysisDetail/incomeAnalysis.vue` (`.analysis-container`)
- Modify: `src/views/finance/financeAnalysis/financeAnalysisDetail/incomeDetail.vue` (`.income-detail`)
- Modify: `src/views/finance/shopStockBatch/shopStockBatchDetail/index.vue` (`.shop-stock-batch-detail-container`)
- Modify: `src/views/selfFinance/prepaidCardInfoT/consume-overview-info/index.vue` (`.consume-overview-container`)

**Interfaces:**

- Consumes: Task 1 纭鐨勮鍒欙紙`min-height: 100%` + padding 鈫?`border-box`锛?
- Produces: 涓婅堪鏍?class 鍧囧惈 `box-sizing: border-box`

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
	padding: 16px 0 72px; // 棰勭暀搴曢儴 Tabbar 楂樺害
}
```

- [ ] **Step 5: Spot-check short content**

鎶芥锛歚gift/analysis`銆佷换涓€ `financeAnalysisDetail`銆乣shopStockBatchDetail`銆傜煭鍐呭鏃?`.content-container` 鏃犵┖婊氥€?

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


