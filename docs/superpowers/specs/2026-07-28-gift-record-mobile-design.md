# 移动端随礼记录完善设计（对齐 PC）

日期：2026-07-28  
项目：`alex_miaosha_mobile`（复用既有 finance gift-record API）  
参考：PC `alex_miaosha_front/src/views/finance/gift/record/` + `gift-record-form-drawer`  
方案：镜像事由/亲友模块结构（方案 A）

## 1. 背景

PC 礼金记录已具备：随筛选变化的四卡汇总、keyword/方向/金额/时间筛选、表格 CRUD、回礼操作、Drawer 表单（方向、事由/人员选择器、RETURN 关联待回礼、金额快捷、`payTime`）、权限控制。

Mobile 现状（`record/index.vue`）为 keyword + 方向 Tab 列表 + 快速记礼 popup；事由/人员/关联记录仍为 ID 占位；无编辑、无 summary、无高级筛选、无权限与完整 `data-testid`。卡片有左滑删除/标记已回，但未接权限门禁。

## 2. 已锁定决策

| 项        | 选择                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------- |
| 能力档位  | PC 能力对等；**不做**独立只读详情页                                                                  |
| 表单承载  | 独立页 `giftRecordDetail`                                                                            |
| 列表点击  | 直接进编辑表单（需 `gift:edit`）                                                                     |
| 回礼      | 保留左滑「标记已回」+ 待回金额提示；**不**强制走 RETURN 表单（RETURN 方向仍可在新增/编辑表单中使用） |
| 筛选/汇总 | PC 全量：summary 四卡 + keyword + 方向 tag + 金额区间 + 支付时间范围                                 |
| 实现路径  | 镜像 event/person（列表 + 详情表单 + pickers + config helpers）                                      |

## 3. 目标

- 列表：summary 四卡（随筛选）、完整筛选、增强卡片字段、权限新增、卡片→编辑、左滑删/标记已回、`?open=create`
- 表单页：GIVE/RECEIVE/RETURN；事由/联系人/机构成员/待回礼 picker；金额快捷对齐 PC；`payTime`；吸底保存；校验完整
- API/类型：summary / detail / update；扩展 `GiftRecordInfo` 展示字段与 `GiftRecordQuery`/`Summary`
- 测试：Vitest + checklist + Midscene 抽样；文档/graphify；隐藏菜单 SQL

## 4. 非目标

- 独立只读详情页（超出 PC Drawer 模式）
- Excel 导出（PC 亦未落地）
- PC 端 UI 改造
- 从亲友/事由详情深链预填记礼（可另开）
- 后端新接口或改表（复用 `/gift-record-info-t/*`）
- Emoji；全局 layout 改造

## 5. 架构

| 单元      | 路径                                                           | 职责                                                                      |
| --------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 列表      | `src/views/finance/gift/record/index.vue`                      | summary + 筛选 + 列表 + 跳转/左滑                                         |
| 卡片      | `src/views/finance/gift/components/GiftRecordCard.vue`         | 展示增强 + 点击/滑动事件                                                  |
| 表单      | `src/views/finance/gift/record/giftRecordDetail/index.vue`     | 新增/编辑 + 吸底保存                                                      |
| Pickers   | `src/views/finance/gift/components/*-picker`（或同级轻量实现） | event / contact / org-member / pending-return                             |
| API       | `src/views/finance/gift/record/api/index.ts`                   | page / summary / detail / add / update / delete / pending / mark-returned |
| Config    | `src/views/finance/gift/config.ts`                             | Record 类型扩展 + `canSaveGiftRecord` + 快捷金额对齐                      |
| 菜单 SQL  | backend `doc/sql/`                                             | 隐藏菜单 `giftRecordDetail`                                               |
| Checklist | `tests/checklists/gift-record-mobile.md`                       | 七点法、状态机、权限、不测理由                                            |

数据流：列表筛选 → Query → page + summary；表单 detail → FormState → add/update；picker 数据来自 person/event/record list API。

## 6. 列表 UX

1. `van-search` keyword（人员/事由/备注）— `data-testid="gift-record-search"`
2. 方向 tag：全部 / 随礼 / 收礼 / 回礼 — `gift-record-direction-tags`
3. 展开筛选：金额 min/max；支付时间 `van-calendar` `type="range"` → `payTimeStart`/`payTimeEnd`（日界 `startOf`/`endOf` + `YYYY-MM-DDTHH:mm:ss`）
4. Summary 四卡（随当前筛选刷新）— `gift-record-summary`：
   - 筛选内收礼 `receiveAmount`
   - 筛选内随礼 `giveAmount`
   - 人情净值 `netAmount`
   - 笔数 `recordCount`
5. `CommonPullRefresh` + `CommonList` + skeleton — `gift-record-list`；每条 `id: String(item.id)`

**卡片字段：** 对方姓名、`eventName`、方向 Tag、`formatSignedMoney`、时间、回礼状态、备注截断 — `gift-record-card`。

**交互：**

- 点击 → `giftRecordDetail?id=`（需 `gift:edit`，否则 toast）+ haptic
- 左滑删除需 `gift:delete`；「标记已回」需 `gift:edit`（与 PC 操作权限对齐）
- 收礼待回：保留金额提示（Toast/Dialog），不跳转 RETURN 表单
- NavBar「快速记礼」+ FAB 均跳转详情无 id（仅 `gift:add`）；去掉 ID 占位 popup
- 支持 `?open=create`

**testid：** `gift-record-search` / `gift-record-direction-tags` / `gift-record-summary` / `gift-record-list` / `gift-record-card` / `gift-record-add`

## 7. 表单 UX

仅 form。标题：快速记礼 / 编辑礼金记录。

| 字段      | 规则                                                         |
| --------- | ------------------------------------------------------------ |
| 方向      | 必填 GIVE / RECEIVE / RETURN                                 |
| RETURN    | 关联收礼记录必选；选中回填 event/人员/金额                   |
| 非 RETURN | 事由必选；GIVE：送礼人=机构成员、收礼人=联系人；RECEIVE 反之 |
| 金额      | 必填 `> 0`；快捷 `[200, 500, 1000, 2000]`（对齐 PC）         |
| 礼金时间  | 可选 datetime → `YYYY-MM-DDTHH:mm:ss`                        |
| 备注      | 可选                                                         |

**保存：** `canSaveGiftRecord` = 方向 +（RETURN→relatedRecordId / 否则 eventId+双方）+ 金额>0 + 双方非同一人；吸底 `gift-record-save`；文案「保存」/「保存更改」；成功回列表。

**默认本人：** 新增时按方向用 `findSelfPersonId(loginUserId)` 预填 giver/receiver。切换方向清空依赖字段。

**Picker：** `van-cell is-link` → 半屏/全屏可搜索列表；挂 testid。

**权限：** 新增 `gift:add`；编辑 `gift:edit`；不满足 toast 回列表。

**testid：** `gift-record-form` / `gift-record-form-direction` / `gift-record-form-amount` / `gift-record-save`

## 8. API / 类型契约

对齐 PC（mobile 分包风格）：

- 扩展 `GiftRecordInfo`：`eventName`、`giverPersonName`、`receiverPersonName`、`personName`、`paymentMethod`、`handlerName`、`orgId`/`userId` 等（ID `string`）
- `GiftRecordQuery`：含 `returnStatus`、`payTimeStart/End`、`amountMin/Max`
- `GiftRecordSummary`：`receiveAmount` / `giveAmount` / `returnAmount` / `netAmount` / `recordCount`
- API：`getGiftRecordSummary(query)`、`getGiftRecordDetail`、`updateGiftRecord`；保留 page/add/delete/pending/mark-returned
- 人员：`getGiftPersonList` + `personScope`；事由：`getGiftEventList`；待回礼：record page + `direction=RECEIVE` + `returnStatus=0`
- 机构成员：对齐 PC `getGiftOrgMemberOptions`（若 mobile person API 已有则复用，否则补齐同路径）

菜单：隐藏 `giftRecordDetail`，path `/finance/gift/record/giftRecordDetail`，对齐 `giftPersonDetail` / `giftEventDetail`。

## 9. 测试与验收

### 9.1 单元

- `canSaveGiftRecord` 边界用例
- 快捷金额常量与 PC 一致（可选）
- 既有 direction/money helpers 不回归

### 9.2 Checklist

`tests/checklists/gift-record-mobile.md`：

```
列表 --(gift:edit 点卡)--> 编辑表单
列表 --(gift:add / ?open=create)--> 新增表单
表单 --(保存成功)--> 列表
列表 --(左滑删 / 标记已回)--> 刷新列表
```

权限：`gift:add` / `gift:edit` / `gift:delete`。

### 9.3 Midscene

- smoke：summary + list testid（`waitForResponse` 先于 goto）
- flow：新增完整选择器路径 → 保存 → 列表；编辑改金额 → 保存
- 权限：无 add / 无 edit
- 禁中文精确匹配；API try/finally 清理

### 9.4 手工

- 与 PC 同筛选摘要趋势一致；三方向走通；左滑回礼
- 菜单 SQL + 刷缓存；lint + graphify + `feature.md`

## 10. 实现顺序（供 plan 拆分）

1. Config 类型扩展 + `canSaveGiftRecord` + Vitest
2. Record API 补齐（summary/detail/update + org-member 若缺）
3. Pickers（event / contact / org-member / pending-return）
4. 列表页重构（summary/筛选/卡片/权限/去 popup）
5. 表单页 + 隐藏菜单 SQL
6. Checklist + Midscene + docs/graphify

## 11. 风险与约束

- 只读用户无法点卡看详情——已接受（无只读详情页）
- 机构成员 API 路径需与后端现网一致，plan 中锁定实际 endpoint
- ID 禁 `number`；API 解构；auto-import 勿重复 import Vue/Vant
- 勿污染菜单 Redis 原始 children；动态路由 name 与菜单 component 一致
- 快捷金额变更影响既有用户习惯：本轮锁定与 PC 一致 `[200,500,1000,2000]`
