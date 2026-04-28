# Graph Report - src  (2026-04-28)

## Corpus Check
- 222 files · ~82,757 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 542 nodes · 735 edges · 21 communities detected
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
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 33|Community 33]]

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
10. `cancelInfo()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `postData()` --calls--> `addCpnCouponInfo()`  [INFERRED]
  src\views\common\api\index.ts → src\views\cpn-coupon\cpn-coupon-info\api\index.ts
- `postData()` --calls--> `getFilePage()`  [INFERRED]
  src\views\common\api\index.ts → src\views\file\api\index.ts
- `postData()` --calls--> `getAccountRecordInfoTestPage()`  [INFERRED]
  src\views\common\api\index.ts → src\views\finance\accountRecordInfoTest\api\index.ts
- `postData()` --calls--> `addAccountRecordInfoTest()`  [INFERRED]
  src\views\common\api\index.ts → src\views\finance\accountRecordInfoTest\api\index.ts
- `postData()` --calls--> `getConsumeCardRecordPage()`  [INFERRED]
  src\views\common\api\index.ts → src\views\finance\consumeCardRecord\api\index.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (85): addAccountRecordInfo(), addFinanceManger(), addOrEditFileManager(), addPmsBrand(), addPmsCategory(), addPmsShopProduct(), addPmsShopWantProduct(), addPmsSkuInfo() (+77 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (43): addOrgInfo(), addPermissionInfo(), addPmsAttr(), addRoleInfo(), addRolePermissionInfo(), addRoleUserInfo(), deleteOrgInfo(), deletePermissionInfo() (+35 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (35): fetchData(), addDictManager(), addShopStock(), deleteBlogById(), deleteDictManager(), deleteShopStock(), editDictManager(), fetchCategories() (+27 more)

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
Cohesion: 0.29
Nodes (9): cancelDateInfo(), cancelInfo(), choose(), chooseDate(), getDictInfoList(), initInfoDate(), onSubmit(), selectDateInfo() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (3): confirmConsume(), getPrepaidCardInfoDetail(), getPrepaidCardInfoDetailInfo()

### Community 8 - "Community 8"
Cohesion: 0.39
Nodes (7): _decode(), decrypt(), errorHandler(), redirectToLogin(), requestHandler(), requestHandlerFile(), responseHandler()

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (7): addUserManager(), deleteUserManager(), editUserManager(), fetchUsers(), getUserManagerDetail(), getUserManagerList(), getUserManagerPage()

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (6): addMenuInfo(), deleteMenuInfo(), delMenuInfo(), getMenuInfoDetail(), getMenuInfoPage(), updateMenuInfo()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (6): addOrgUserInfo(), deleteOrgUserInfo(), delOrgUserInfo(), getOrgUserInfoDetail(), getOrgUserInfoPage(), updateOrgUserInfo()

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (1): vue (AutoImport)

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (2): getChildren(), resolveViewComponent()

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (5): addAccountRecordInfoTest(), deleteAccountRecordInfoTest(), getAccountRecordInfoTestDetail(), getAccountRecordInfoTestPage(), updateAccountRecordInfoTest()

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): addConsumeCardRecord(), deleteConsumeCardRecord(), getConsumeCardRecordDetail(), getConsumeCardRecordPage(), updateConsumeCardRecord()

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (5): addShopOrderDetail(), deleteShopOrderDetail(), getShopOrderDetailDetail(), getShopOrderDetailPage(), updateShopOrderDetail()

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (5): addShopStockAttrs(), deleteShopStockAttrs(), getShopStockAttrsDetail(), getShopStockAttrsPage(), updateShopStockAttrs()

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (1): algorithmProxy

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (1): vue-router (AutoImport)

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (1): pinia (AutoImport)

## Knowledge Gaps
- **1 isolated node(s):** `pinia (AutoImport)`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 12`** (7 nodes): `computed()`, `onMounted()`, `onUnmounted()`, `reactive()`, `ref()`, `watch()`, `vue (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (6 nodes): `addRouter()`, `getChildren()`, `judgePermission()`, `refreshRouter()`, `resolveViewComponent()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (4 nodes): `algorithmProxy`, `.constructor()`, `.increaseIndexes()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `useRoute()`, `useRouter()`, `vue-router (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `defineStore()`, `pinia (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `postData()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 9`, `Community 10`, `Community 11`, `Community 14`, `Community 15`, `Community 16`, `Community 17`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Why does `getData()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 14`, `Community 15`, `Community 16`, `Community 17`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `init()` connect `Community 1` to `Community 0`, `Community 2`, `Community 6`, `Community 7`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Are the 71 inferred relationships involving `postData()` (e.g. with `getCpnCouponInfoPage()` and `addCpnCouponInfo()`) actually correct?**
  _`postData()` has 71 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `getData()` (e.g. with `getCpnCouponInfoDetail()` and `getCpnUserCouponInfoDetail()`) actually correct?**
  _`getData()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `putData()` (e.g. with `editCpnCouponInfo()` and `addOrEditFileManager()`) actually correct?**
  _`putData()` has 31 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `deleteData()` (e.g. with `deleteCpnCouponInfo()` and `deleteDictManager()`) actually correct?**
  _`deleteData()` has 31 INFERRED edges - model-reasoned connections that need verification._