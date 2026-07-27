# 移动端事由管理完善设计（对齐 PC）

日期：2026-07-27  
项目：`alex_miaosha_mobile`（复用既有 finance gift-event API）  
参考：PC `alex_miaosha_front/src/views/finance/gift/event/`  
方案：镜像亲友模块结构（方案 A）

## 1. 背景

PC 事由管理已具备：摘要三卡、keyword/类型/快捷 tag/时间筛选、`business-page` 列表、Drawer CRUD、类型 preset/自定义（`eventTypeOptionId`）、权限控制。

Mobile 现状（`event/index.vue`）仅为 keyword 列表 + 底部 popup 快速新增（自由文本 `eventType`），缺少编辑/删除/详情路由、business 字段、摘要、筛选、类型契约、权限与 `data-testid`。

## 2. 已锁定决策

| 项 | 选择 |
| --- | --- |
| 能力档位 | PC 能力对等；**不做**事由 profile + 关联礼金历史 |
| 表单承载 | 独立页 `giftEventDetail`（对齐亲友） |
| 列表点击 | 直接进编辑表单（需 `gift:edit`） |
| 筛选/摘要 | PC 全量：summary + keyword + 快捷 tag + 类别 + 时间范围 |
| 实现路径 | 镜像 person 模块（列表 + 详情表单 + composable + config helpers） |

## 3. 目标

- 列表：摘要三卡、完整筛选、`getGiftEventBusinessPage`、卡片展示 business 字段、权限新增、`?open=create`
- 表单页：新增/编辑；类型 preset/自定义；`eventTime`；吸底保存；编辑态删除
- 配置/API：对齐 PC 的 `GiftEvent*` 类型、helpers、`useGiftEventTypeOptions`、完整 event API
- 测试：Vitest helpers + checklist + Midscene 抽样；文档/graphify 同步

## 4. 非目标

- 事由详情 profile / 按 eventId 展示往来历史（超出 PC）
- PC 端 UI 改造
- 礼金记录页事由选择器（`gift-event-picker`）——另开任务
- 后端新接口或改表（复用现有 `/gift-event-info-t/*`）
- Emoji；全局 layout 改造
- 备注前端硬限 50（事由备注对齐 PC，不硬限）

## 5. 架构

| 单元 | 路径 | 职责 |
| --- | --- | --- |
| 列表 | `src/views/finance/gift/event/index.vue` | summary + 筛选 + business 列表 + 跳转编辑/新增 |
| 表单 | `src/views/finance/gift/event/giftEventDetail/index.vue` | 新增/编辑/删除；吸底保存 |
| API | `src/views/finance/gift/event/api/index.ts` | business-page / summary / detail / add / update / delete / event-type-options；ID 转 string |
| Config | `src/views/finance/gift/config.ts` | `GiftEventInfo/Business/Summary/Query/FormState` + `EVENT_TYPE_CUSTOM` + map/build/eventLabel 等 |
| Composable | `src/composables/useGiftEventTypeOptions.ts` | 对齐 PC：options / quickEvents / load / resolveFilter / map |
| Checklist | `tests/checklists/gift-event-mobile.md` | 七点法、状态机、权限、不测理由 |
| 路由 | 动态菜单或静态补充 | name：`giftEventDetail`；列表支持 `?open=create` |

数据流：列表筛选 → Query → business-page；摘要独立 summary；表单 detail → FormState → add/update；类型选项缓存于 composable。

## 6. 列表 UX

1. `van-search` keyword（名称/备注）
2. 类型快捷 tag（`quickEvents` 前 3，toggle）
3. 展开筛选：事由类别选择 + 时间范围 → `eventTimeStart` / `eventTimeEnd`（`YYYY-MM-DDTHH:mm:ss`）
4. Summary：本月待办 / 累计礼金 / 活跃联系人
5. `CommonPullRefresh` + `CommonList` + skeleton

**卡片字段：** `eventName`；`eventLabel(eventType)` · `eventTime`；可选 `locationText`；状态；参与人数；礼金总额；remark 一行截断。

**交互：** 卡片 → `giftEventDetail?id=`（`gift:edit`，否则 toast）；NavBar 新增仅 `gift:add`；去掉现有双入口 popup；haptic；复用 `shared.less`。

**testid：** `gift-event-search` / `gift-event-type-tags` / `gift-event-summary` / `gift-event-list` / `gift-event-card` / `gift-event-add`

## 7. 表单 UX

仅 form 模式（无 profile）。标题：新增事由 / 编辑事由。

| 字段 | 规则 |
| --- | --- |
| 事由名称 | 必填 |
| 类型 | ActionSheet；preset +「自定义…」 |
| 自定义类型 | CUSTOM 时必填，≤20，不可与 preset 重名 |
| 事由时间 | 可选；datetime picker → `YYYY-MM-DDTHH:mm:ss`（`@/utils/dayjs`） |
| 备注 | 可选，不硬限 50 |

**保存：** `canSave` = 名称非空 + 已选类型（CUSTOM 时自定义非空）；吸底 `gift-event-save`；「保存」/「保存更改」；payload 用 `buildEventTypeForSave`；成功回列表。

**删除：** 仅编辑态 + `gift:delete`；Confirm → `deleteGiftEvent` → 列表；testid `gift-event-delete`。

视觉：轻量分组卡（基础信息 / 更多），对齐 person form token，无 emoji。

## 8. API / 类型契约

对齐 PC `gift/api` + `config`：

- `GiftEventInfo`：含 `eventTypeOptionId`、`orgId`、`userId`、`hostPersonId` 等（ID 一律 `string`）
- `GiftEventBusinessInfo`：`participantCount` / `totalAmount` / `eventStatus` / `locationText` 等
- `GiftEventSummary` / `GiftEventQuery` / `GiftEventFormState`
- Helpers：`mapEventTypeToFormFields`、`buildEventTypeForSave`、`eventLabel`、`resolveFilterEventType`、`FALLBACK_GIFT_EVENT_OPTIONS`
- API 响应递归把 `id` / `*Id` 规范为 string（与 person 列表加载一致）

后端无需改动；若菜单缺 `giftEventDetail`，补 SQL/菜单与 person 详情同级（plan 锁定）。

## 9. 测试与验收

### 9.1 单元

- `config.spec.ts`：event type map/build/label/filter helpers
- 可选：`canSave` 纯函数边界

### 9.2 Checklist

`tests/checklists/gift-event-mobile.md`：

```
列表 --(gift:edit 点卡片)--> 编辑表单
列表 --(gift:add / ?open=create)--> 新增表单
表单 --(保存成功)--> 列表
表单 --(删除/gift:delete)--> 列表
```

权限矩阵：`gift:add` / `gift:edit` / `gift:delete`（列表浏览不强制 `gift:view` 卡死，与现网 person 列表一致即可；点编辑需 edit）。

### 9.3 Midscene

- smoke：列表 summary + list testid
- flow：新增→保存→列表；编辑改名→保存
- 权限：无 add 无入口；无 edit 点卡片失败提示
- 禁止中文精确匹配；`waitForResponse`；API try/finally 清理

### 9.4 手工

- 与 PC 同账号摘要趋势一致；类型 preset 互通
- 筛选四类生效；`?open=create`；lint + graphify + `feature.md` / `.cursorrules` 或 `DEVELOPMENT.md` 同步

## 10. 实现顺序（供 plan 拆分）

1. Config + helpers + composable + Vitest  
2. Event API 补齐 + ID 规范化  
3. 列表页重构（summary/筛选/business/权限/testid）  
4. 表单页新建（路由/菜单、CRUD、吸底、删除）  
5. Checklist + Midscene 抽样 + 文档/graphify  

## 11. 风险与约束

- 卡片进编辑（非 view）：只读用户无法看详情——已接受（无 profile）
- 时间筛选组件选型（calendar vs datetime）在 plan 中按 Vant 现有用法锁定一种
- 勿污染 Redis/菜单缓存结构；动态路由 name 与后端菜单 component 一致
- 前端 ID 禁 `number`；API 解构 `const { code, data, message }`；auto-import 勿重复 import Vue/Vant
