# Graph Report - src  (2026-05-04)

## Corpus Check
- 221 files · ~82,941 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 542 nodes · 734 edges · 19 communities detected
- Extraction: 67% EXTRACTED · 33% INFERRED · 0% AMBIGUOUS · INFERRED: 242 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `postData()` - 73 edges
2. `getData()` - 52 edges
3. `putData()` - 33 edges
4. `deleteData()` - 33 edges
5. `init()` - 32 edges
6. `query()` - 20 edges
7. `emit()` - 13 edges
8. `onRefresh()` - 12 edges
9. `onSearch()` - 10 edges
10. `onSubmit()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `postData()` --calls--> `addCpnCouponInfo()`  [INFERRED]
  src\views\common\api\index.ts → src\views\cpn-coupon\cpn-coupon-info\api\index.ts
- `postData()` --calls--> `getDictManagerPage()`  [INFERRED]
  src\views\common\api\index.ts → src\views\finance\dict\api\index.ts
- `postData()` --calls--> `addDictManager()`  [INFERRED]
  src\views\common\api\index.ts → src\views\finance\dict\api\index.ts
- `postData()` --calls--> `addFinanceManger()`  [INFERRED]
  src\views\common\api\index.ts → src\views\finance\financeManager\api\index.ts
- `postData()` --calls--> `getShopStockPage()`  [INFERRED]
  src\views\common\api\index.ts → src\views\finance\shopStock\api\index.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (94): addAccountRecordInfo(), addAccountRecordInfoTest(), addConsumeCardRecord(), addFileManager(), addPmsBrand(), addPmsShopProduct(), addPmsShopWantProduct(), addPrepaidCardInfo() (+86 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (43): addMenuInfo(), addOrgInfo(), addOrgUserInfo(), addPmsAttr(), addRoleInfo(), addRoleUserInfo(), deleteMenuInfo(), deleteOrgInfo() (+35 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (32): fetchData(), addDictManager(), addShopStock(), deleteBlogById(), deleteShopStock(), editDictManager(), fetchCategories(), getAllAmount() (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (17): addCpnCouponInfo(), confirmDelete(), deleteCpnCouponInfo(), editCpnCouponInfo(), getCpnCouponInfoDetail(), getCpnCouponInfoPage(), getCpnCouponInfoPageData(), getCpnUserCouponPageData() (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (18): emit(), onRefresh(), onCancel(), onClickOverlay(), onConfirm(), handleClick(), onDelete(), cancel() (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.1
Nodes (7): formatAmount(), formatDate(), formatTime(), getDetailRoutePath(), getListName(), getRoutePathByName(), getValidityText()

### Community 6 - "Community 6"
Cohesion: 0.32
Nodes (9): cancelDateInfo(), cancelInfo(), choose(), chooseDate(), getDictInfoList(), initInfoDate(), onSubmit(), selectDateInfo() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (10): addPmsCategory(), addPmsSkuInfo(), deletePmsCategory(), deletePmsSkuInfo(), getPmsCategoryDetail(), getPmsCategoryPage(), getPmsSkuInfoDetail(), getPmsSkuInfoPage() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.2
Nodes (3): confirmConsume(), getPrepaidCardInfoDetail(), getPrepaidCardInfoDetailInfo()

### Community 9 - "Community 9"
Cohesion: 0.39
Nodes (7): _decode(), decrypt(), errorHandler(), redirectToLogin(), requestHandler(), requestHandlerFile(), responseHandler()

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (7): addUserManager(), deleteUserManager(), editUserManager(), fetchUsers(), getUserManagerDetail(), getUserManagerList(), getUserManagerPage()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (6): addPermissionInfo(), deletePermissionInfo(), delPermissionInfo(), getPermissionInfoDetail(), getPermissionInfoPage(), updatePermissionInfo()

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): addRolePermissionInfo(), deleteRolePermissionInfo(), delRolePermissionInfo(), getRolePermissionInfoDetail(), getRolePermissionInfoPage(), updateRolePermissionInfo()

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (1): vue (AutoImport)

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (2): getChildren(), resolveViewComponent()

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): addFinanceManger(), deleteFinanceManager(), editFinanceManger(), getFinanceMangerDetail(), getFinanceMangerPage()

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (1): algorithmProxy

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (1): vue-router (AutoImport)

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (1): pinia (AutoImport)

## Knowledge Gaps
- **1 isolated node(s):** `pinia (AutoImport)`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (7 nodes): `computed()`, `onMounted()`, `onUnmounted()`, `reactive()`, `ref()`, `watch()`, `vue (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (6 nodes): `addRouter()`, `getChildren()`, `judgePermission()`, `refreshRouter()`, `resolveViewComponent()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (4 nodes): `algorithmProxy`, `.constructor()`, `.increaseIndexes()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (3 nodes): `useRoute()`, `useRouter()`, `vue-router (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `defineStore()`, `pinia (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `postData()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 7`, `Community 10`, `Community 11`, `Community 12`, `Community 15`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `getData()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 7`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 15`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `init()` connect `Community 1` to `Community 0`, `Community 2`, `Community 6`, `Community 8`, `Community 11`, `Community 12`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Are the 71 inferred relationships involving `postData()` (e.g. with `getCpnCouponInfoPage()` and `addCpnCouponInfo()`) actually correct?**
  _`postData()` has 71 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `getData()` (e.g. with `getCpnCouponInfoDetail()` and `getCpnUserCouponInfoDetail()`) actually correct?**
  _`getData()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `putData()` (e.g. with `editCpnCouponInfo()` and `editFileManager()`) actually correct?**
  _`putData()` has 31 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `deleteData()` (e.g. with `deleteCpnCouponInfo()` and `deleteDictManager()`) actually correct?**
  _`deleteData()` has 31 INFERRED edges - model-reasoned connections that need verification._