# Graph Report - src  (2026-04-26)

## Corpus Check
- 223 files · ~82,324 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 544 nodes · 743 edges · 20 communities detected
- Extraction: 67% EXTRACTED · 33% INFERRED · 0% AMBIGUOUS · INFERRED: 243 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 32|Community 32]]

## God Nodes (most connected - your core abstractions)
1. `postData()` - 73 edges
2. `getData()` - 52 edges
3. `init()` - 34 edges
4. `putData()` - 33 edges
5. `deleteData()` - 33 edges
6. `query()` - 20 edges
7. `emit()` - 13 edges
8. `onRefresh()` - 12 edges
9. `cancelInfo()` - 11 edges
10. `onSearch()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `postData()` --calls--> `addCpnCouponInfo()`  [INFERRED]
  src\views\common\api\index.ts → src\views\cpn-coupon\cpn-coupon-info\api\index.ts
- `postData()` --calls--> `getFilePage()`  [INFERRED]
  src\views\common\api\index.ts → src\views\file\api\index.ts
- `postData()` --calls--> `getConsumeCardRecordPage()`  [INFERRED]
  src\views\common\api\index.ts → src\views\finance\consumeCardRecord\api\index.ts
- `postData()` --calls--> `addConsumeCardRecord()`  [INFERRED]
  src\views\common\api\index.ts → src\views\finance\consumeCardRecord\api\index.ts
- `postData()` --calls--> `getDictManagerPage()`  [INFERRED]
  src\views\common\api\index.ts → src\views\finance\dict\api\index.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (88): addAccountRecordInfo(), addAccountRecordInfoTest(), addFinanceManger(), addOrEditFileManager(), addPmsBrand(), addPmsCategory(), addPmsShopWantProduct(), addPmsSkuInfo() (+80 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (35): addMenuInfo(), addOrgInfo(), addOrgUserInfo(), addPmsAttr(), addRolePermissionInfo(), deleteMenuInfo(), deleteOrgInfo(), deleteOrgUserInfo() (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (33): fetchData(), addPmsShopProduct(), addShopStock(), deleteBlogById(), deletePmsShopProduct(), deleteShopStock(), getAllAmount(), getAllStock() (+25 more)

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (14): cancelDateInfo(), cancelInfo(), choose(), chooseDate(), confirmConsume(), getDictInfoList(), getPrepaidCardInfoDetail(), getPrepaidCardInfoDetailInfo() (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (17): addCpnCouponInfo(), confirmDelete(), deleteCpnCouponInfo(), editCpnCouponInfo(), getCpnCouponInfoDetail(), getCpnCouponInfoPage(), getCpnCouponInfoPageData(), getCpnUserCouponPageData() (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (18): emit(), onRefresh(), onCancel(), onClickOverlay(), onConfirm(), handleClick(), onDelete(), cancel() (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (7): formatAmount(), formatDate(), formatTime(), getDetailRoutePath(), getListName(), getRoutePathByName(), getValidityText()

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (9): addDictManager(), deleteDictManager(), editDictManager(), fetchCategories(), getDictList(), getDictManagerDetail(), getDictManagerPage(), getFileDetail() (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.39
Nodes (7): _decode(), decrypt(), errorHandler(), redirectToLogin(), requestHandler(), requestHandlerFile(), responseHandler()

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (7): addUserManager(), deleteUserManager(), editUserManager(), fetchUsers(), getUserManagerDetail(), getUserManagerList(), getUserManagerPage()

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (6): addPermissionInfo(), deletePermissionInfo(), delPermissionInfo(), getPermissionInfoDetail(), getPermissionInfoPage(), updatePermissionInfo()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (6): addRoleInfo(), deleteRoleInfo(), delRoleInfo(), getRoleInfoDetail(), getRoleInfoPage(), updateRoleInfo()

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): addRoleUserInfo(), deleteRoleUserInfo(), delRoleUserInfo(), getRoleUserInfoDetail(), getRoleUserInfoPage(), updateRoleUserInfo()

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (1): vue (AutoImport)

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (2): getChildren(), resolveViewComponent()

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): addConsumeCardRecord(), deleteConsumeCardRecord(), getConsumeCardRecordDetail(), getConsumeCardRecordPage(), updateConsumeCardRecord()

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (5): addShopFinance(), deleteShopFinance(), getShopFinanceDetail(), getShopFinancePage(), updateShopFinance()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (1): algorithmProxy

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (1): vue-router (AutoImport)

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (1): pinia (AutoImport)

## Knowledge Gaps
- **1 isolated node(s):** `pinia (AutoImport)`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (7 nodes): `computed()`, `onMounted()`, `onUnmounted()`, `reactive()`, `ref()`, `watch()`, `vue (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (6 nodes): `addRouter()`, `getChildren()`, `judgePermission()`, `refreshRouter()`, `resolveViewComponent()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (4 nodes): `algorithmProxy`, `.constructor()`, `.increaseIndexes()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `useRoute()`, `useRouter()`, `vue-router (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `defineStore()`, `pinia (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `postData()` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 15`, `Community 16`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Why does `getData()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 15`, `Community 16`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `init()` connect `Community 3` to `Community 0`, `Community 1`, `Community 7`, `Community 10`, `Community 11`, `Community 12`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Are the 71 inferred relationships involving `postData()` (e.g. with `getCpnCouponInfoPage()` and `addCpnCouponInfo()`) actually correct?**
  _`postData()` has 71 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `getData()` (e.g. with `getCpnCouponInfoDetail()` and `getCpnUserCouponInfoDetail()`) actually correct?**
  _`getData()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `init()` (e.g. with `getAccountRecordInfoDetail()` and `getDictList()`) actually correct?**
  _`init()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `putData()` (e.g. with `editCpnCouponInfo()` and `addOrEditFileManager()`) actually correct?**
  _`putData()` has 31 INFERRED edges - model-reasoned connections that need verification._