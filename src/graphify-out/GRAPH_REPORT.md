# Graph Report - src  (2026-08-11)

## Corpus Check
- 224 files · ~87,134 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 561 nodes · 728 edges · 20 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 248 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 30|Community 30]]

## God Nodes (most connected - your core abstractions)
1. `postData()` - 75 edges
2. `getData()` - 52 edges
3. `putData()` - 33 edges
4. `deleteData()` - 33 edges
5. `init()` - 24 edges
6. `query()` - 16 edges
7. `emit()` - 14 edges
8. `refresh()` - 10 edges
9. `if()` - 9 edges
10. `choose()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `postData()` --calls--> `redeemCpnUserCouponInfo()`  [INFERRED]
  D:\project\alex_miaosha_mobile\src\views\common\api\index.ts → D:\project\alex_miaosha_mobile\src\views\cpn-coupon\cpn-user-coupon-info\api\index.ts
- `postData()` --calls--> `getFilePage()`  [INFERRED]
  D:\project\alex_miaosha_mobile\src\views\common\api\index.ts → D:\project\alex_miaosha_mobile\src\views\file\api\index.ts
- `postData()` --calls--> `getDictManagerPage()`  [INFERRED]
  D:\project\alex_miaosha_mobile\src\views\common\api\index.ts → D:\project\alex_miaosha_mobile\src\views\finance\dict\api\index.ts
- `postData()` --calls--> `addDictManager()`  [INFERRED]
  D:\project\alex_miaosha_mobile\src\views\common\api\index.ts → D:\project\alex_miaosha_mobile\src\views\finance\dict\api\index.ts
- `postData()` --calls--> `addFinanceManger()`  [INFERRED]
  D:\project\alex_miaosha_mobile\src\views\common\api\index.ts → D:\project\alex_miaosha_mobile\src\views\finance\financeManager\api\index.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (85): addAccountRecordInfo(), addAccountRecordInfoTest(), addConsumeCardRecord(), addCpnCouponInfo(), addPmsCategory(), addPmsShopWantProduct(), addPmsSkuInfo(), addPrepaidCardInfo() (+77 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (42): addMenuInfo(), addOrgUserInfo(), addPermissionInfo(), addPmsAttr(), addRoleInfo(), addRoleUserInfo(), deleteMenuInfo(), deleteOrgUserInfo() (+34 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (29): fetchData(), addPmsShopProduct(), addShopStock(), deleteBlogById(), deletePmsShopProduct(), deleteShopStock(), getAllAmount(), getAllStock() (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (19): emit(), onSelect(), onRefresh(), onCancel(), onClickOverlay(), onConfirm(), handleClick(), onDelete() (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (6): formatAmount(), formatTime(), getDetailRoutePath(), getListName(), getRoutePathByName(), if()

### Community 5 - "Community 5"
Cohesion: 0.19
Nodes (9): cancelDateInfo(), cancelInfo(), choose(), chooseDate(), getDictInfoList(), initInfoDate(), onSubmit(), selectDateInfo() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (19): addFinanceManger(), cancelRedeemCpnUserCouponInfo(), deleteFinanceManager(), editFinanceManger(), getCpnUserCouponInfoDetail(), getCpnUserCouponInfoPage(), getCpnUserCouponPageData(), getFinanceMangerDetail() (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (15): getBenefit(), getChainAndYear(), getDayShopFinanceInfo(), getMonthShopFinanceInfo(), getPayWayInfo(), getShopNameInfo(), getPayWayInfoInfo(), getShopNameInfoInfo() (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (16): addRouter(), buildPermissionContext(), buildRouteAccess(), canAccessRoutePermission(), getChildren(), getChildrenField(), getPermissionList(), getRoleCode() (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (11): addDictManager(), addFileManager(), deleteDictManager(), editDictManager(), editFileManager(), fetchCategories(), getDictList(), getDictManagerDetail() (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.39
Nodes (7): _decode(), decrypt(), errorHandler(), redirectToLogin(), requestHandler(), requestHandlerFile(), responseHandler()

### Community 11 - "Community 11"
Cohesion: 0.39
Nodes (6): addOrgInfo(), deleteOrgInfo(), getOrgInfoDetail(), getOrgInfoPage(), getOrgInfoTree(), updateOrgInfo()

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (7): addUserManager(), deleteUserManager(), editUserManager(), fetchUsers(), getUserManagerDetail(), getUserManagerList(), getUserManagerPage()

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (6): addRolePermissionInfo(), deleteRolePermissionInfo(), delRolePermissionInfo(), getRolePermissionInfoDetail(), getRolePermissionInfoPage(), updateRolePermissionInfo()

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (1): vue (AutoImport)

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): addPmsBrand(), deletePmsBrand(), getPmsBrandDetail(), getPmsBrandPage(), updatePmsBrand()

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (5): addShopStockAttrs(), deleteShopStockAttrs(), getShopStockAttrsDetail(), getShopStockAttrsPage(), updateShopStockAttrs()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (1): algorithmProxy

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (1): vue-router (AutoImport)

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (1): pinia (AutoImport)

## Knowledge Gaps
- **1 isolated node(s):** `pinia (AutoImport)`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 14`** (7 nodes): `computed()`, `onMounted()`, `onUnmounted()`, `reactive()`, `ref()`, `watch()`, `vue (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (4 nodes): `index.ts`, `algorithmProxy`, `.constructor()`, `.increaseIndexes()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (3 nodes): `useRoute()`, `useRouter()`, `vue-router (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `defineStore()`, `pinia (AutoImport)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getData()` connect `Community 2` to `Community 0`, `Community 1`, `Community 6`, `Community 7`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 16`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `postData()` connect `Community 0` to `Community 1`, `Community 2`, `Community 6`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 16`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `init()` connect `Community 1` to `Community 0`, `Community 5`, `Community 9`, `Community 11`, `Community 13`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Are the 73 inferred relationships involving `postData()` (e.g. with `getCpnCouponInfoPage()` and `addCpnCouponInfo()`) actually correct?**
  _`postData()` has 73 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `getData()` (e.g. with `getCpnCouponInfoDetail()` and `getCpnUserCouponInfoDetail()`) actually correct?**
  _`getData()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `putData()` (e.g. with `editCpnCouponInfo()` and `editFileManager()`) actually correct?**
  _`putData()` has 31 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `deleteData()` (e.g. with `deleteCpnCouponInfo()` and `deleteDictManager()`) actually correct?**
  _`deleteData()` has 31 INFERRED edges - model-reasoned connections that need verification._