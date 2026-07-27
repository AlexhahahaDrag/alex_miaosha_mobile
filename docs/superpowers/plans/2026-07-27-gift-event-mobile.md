# Gift Event Mobile Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 mobile 事由管理对齐 PC：summary + 全量筛选 + business 列表 + 独立表单页 CRUD（类型 preset/自定义、`eventTime`、权限、testid）。

**Architecture:** 镜像亲友模块——`event/index.vue` 列表 + `event/giftEventDetail/index.vue` 表单；从 PC 移植 `GiftEvent*` 类型/helpers + `useGiftEventTypeOptions`；复用现有 finance `/gift-event-info-t/*` API；隐藏菜单 `giftEventDetail` 对齐 `giftPersonDetail`。

**Tech Stack:** Vue3 + Vant4 + Vitest；`usePagination` / `CommonList` / `CommonPullRefresh`；dayjs via `@/utils/dayjs`

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-27-gift-event-mobile-design.md`
- 无事由 profile / 关联礼金历史；无 PC UI 改；无 record 事由选择器；无后端新接口
- ID 前端一律 `string`；API `const { code, data, message } = await ...`
- 勿重复 import 已 auto-import 的 Vue/Vant
- 无 emoji；卡片进编辑需 `gift:edit`；新增需 `gift:add`；删除需 `gift:delete`
- 备注不硬限 50；时间格式存 `YYYY-MM-DDTHH:mm:ss`
- 提交英文 message；Windows 注意中文乱码；勿手加 Co-authored-by
- 工作区：`f:/workplace/project/myself/frontend/alex_miaosha_mobile`；菜单 SQL 在 backend `alex_miaosha/doc/sql/`

---

## File Map

| File | Responsibility |
| --- | --- |
| `src/views/finance/gift/config.ts` | Event types + helpers + `canSaveGiftEvent` + `GIFT_EVENT_DETAIL_NAME` |
| `src/views/finance/gift/config.spec.ts` | Event helper unit tests |
| `src/views/finance/gift/event/api/index.ts` | Full event API |
| `src/composables/useGiftEventTypeOptions.ts` | Type options composable（对齐 PC / person relation） |
| `src/views/finance/gift/event/index.vue` | List：summary / 筛选 / business / 跳转 |
| `src/views/finance/gift/event/giftEventDetail/index.vue` | Form CRUD + sticky save + delete |
| `doc/sql/...`（backend） | `giftEventDetail` 隐藏菜单 INSERT |
| `tests/checklists/gift-event-mobile.md` | Checklist |
| Midscene cases / scripts | smoke/flow 抽样 |
| `feature.md` + graphify | 文档同步 |

---

### Task 1: Config types + event helpers (TDD)

**Files:**
- Modify: `src/views/finance/gift/config.ts`
- Test: `src/views/finance/gift/config.spec.ts`

**Interfaces:**
- Produces: `GiftEventInfo`（扩展）、`GiftEventBusinessInfo`、`GiftEventSummary`、`GiftEventQuery`、`GiftEventFormState`、`GiftEventTypeOptionItem`、`GiftEventTypeOptions`、`EVENT_TYPE_CUSTOM`、`FALLBACK_GIFT_EVENT_OPTIONS`、`GIFT_EVENT_DETAIL_NAME`、`resolveEventPresetCode`、`buildGiftEventTypeSelectOptions`、`isPresetEventType`、`findEventTypeOptionId`、`mapEventTypeToFormFields`、`buildEventTypeForSave`、`eventLabel`、`canSaveGiftEvent`、`eventStatusText`

- [ ] **Step 1: Failing tests**

在 `config.spec.ts` 追加：

```ts
import {
	EVENT_TYPE_CUSTOM,
	FALLBACK_GIFT_EVENT_OPTIONS,
	buildEventTypeForSave,
	canSaveGiftEvent,
	eventLabel,
	eventStatusText,
	mapEventTypeToFormFields,
	resolveEventPresetCode,
} from './config';

describe('gift event type helpers', () => {
	it('resolveEventPresetCode maps 婚礼 id to WEDDING', () => {
		expect(resolveEventPresetCode('9100000000000000001')).toBe('WEDDING');
	});

	it('mapEventTypeToFormFields uses CUSTOM for unknown type', () => {
		const form = mapEventTypeToFormFields({ eventType: '同学聚会' });
		expect(form.eventTypeMode).toBe(EVENT_TYPE_CUSTOM);
		expect(form.customEventType).toBe('同学聚会');
	});

	it('buildEventTypeForSave returns eventTypeOptionId for preset mode', () => {
		expect(
			buildEventTypeForSave({ eventTypeMode: '9100000000000000002' }),
		).toEqual({ eventTypeOptionId: '9100000000000000002' });
	});

	it('eventLabel resolves WEDDING to 婚礼', () => {
		expect(eventLabel('WEDDING', FALLBACK_GIFT_EVENT_OPTIONS)).toBe('婚礼');
	});

	it('canSaveGiftEvent requires name and type', () => {
		expect(canSaveGiftEvent({})).toBe(false);
		expect(canSaveGiftEvent({ eventName: '婚礼', eventTypeMode: '9100000000000000001' })).toBe(true);
		expect(
			canSaveGiftEvent({
				eventName: 'x',
				eventTypeMode: EVENT_TYPE_CUSTOM,
				customEventType: '',
			}),
		).toBe(false);
	});

	it('eventStatusText defaults to 进行中', () => {
		expect(eventStatusText('已完成')).toBe('已完成');
		expect(eventStatusText(undefined)).toBe('进行中');
	});
});
```

- [ ] **Step 2: Run FAIL**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: FAIL（exports missing）

- [ ] **Step 3: Implement in `config.ts`**

扩展/替换现有精简 `GiftEventInfo`，并增加（对齐 PC，mobile 风格）：

```ts
export const GIFT_EVENT_DETAIL_NAME = 'giftEventDetail';

export interface GiftEventInfo {
	id?: GiftId;
	orgId?: GiftId;
	userId?: GiftId;
	eventName?: string;
	eventType?: string;
	eventTypeOptionId?: GiftId;
	eventTime?: string;
	hostPersonId?: GiftId;
	remark?: string;
	createTime?: string;
}

export interface GiftEventBusinessInfo extends GiftEventInfo {
	participantCount?: number;
	totalAmount?: number;
	receiveAmount?: number;
	giveAmount?: number;
	eventStatus?: string;
	locationText?: string;
}

export interface GiftEventSummary {
	monthPendingCount?: number;
	totalAmount?: number;
	activePersonCount?: number;
}

export interface GiftEventQuery {
	keyword?: string;
	eventType?: string;
	eventTimeStart?: string;
	eventTimeEnd?: string;
}

export interface GiftEventTypeOptionItem {
	id: string;
	name: string;
}

export interface GiftEventTypeOptions {
	presets?: GiftEventTypeOptionItem[];
	customs?: GiftEventTypeOptionItem[];
}

export interface GiftEventFormState extends GiftEventInfo {
	eventTypeMode?: string;
	customEventType?: string;
}

export const FALLBACK_GIFT_EVENT_OPTIONS: GiftEventTypeOptionItem[] = [
	{ id: '9100000000000000001', name: '婚礼' },
	{ id: '9100000000000000002', name: '满月' },
	{ id: '9100000000000000003', name: '乔迁' },
	{ id: '9100000000000000004', name: '升学' },
	{ id: '9100000000000000005', name: '寿宴' },
	{ id: '9100000000000000006', name: '其他' },
];

const EVENT_PRESET_NAME_TO_CODE: Record<string, string> = {
	婚礼: 'WEDDING',
	满月: 'BIRTH',
	乔迁: 'HOUSEWARMING',
	升学: 'EDUCATION',
	寿宴: 'BIRTHDAY',
	其他: 'OTHER',
};

export const EVENT_TYPE_CUSTOM = 'CUSTOM';

// resolveEventPresetCode / buildGiftEventTypeSelectOptions / isPresetEventType /
// findEventTypeOptionId / mapEventTypeToFormFields / buildEventTypeForSave / eventLabel
// —— 逻辑与 PC alex_miaosha_front/.../gift/config.ts 对应函数一致；
// buildGiftEventTypeSelectOptions 返回 GiftRelationSelectGroup[]，复用 toSelectOptions（结构兼容）。

export function canSaveGiftEvent(form: GiftEventFormState): boolean {
	if (!form.eventName?.trim()) return false;
	if (!form.eventTypeMode) return false;
	if (form.eventTypeMode === EVENT_TYPE_CUSTOM) {
		return !!form.customEventType?.trim();
	}
	return true;
}

export function eventStatusText(status?: string): string {
	return status?.trim() || '进行中';
}
```

- [ ] **Step 4: Run PASS**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/views/finance/gift/config.ts src/views/finance/gift/config.spec.ts
git commit -m "feat(gift): add event type helpers and form save guard"
```

---

### Task 2: Event API + useGiftEventTypeOptions

**Files:**
- Modify: `src/views/finance/gift/event/api/index.ts`
- Create: `src/composables/useGiftEventTypeOptions.ts`

**Interfaces:**
- Consumes: Task 1 types；`getData`/`postData`/`putData`/`deleteData` from `@/views/common/api`
- Produces: `getGiftEventBusinessPage`、`getGiftEventSummary`、`getGiftEventTypeOptions`、`getGiftEventDetail`、`updateGiftEvent`、`deleteGiftEvent`（保留 page/list/add）；composable API 对齐 PC

- [ ] **Step 1: Rewrite `event/api/index.ts`**

对齐 person API 风格：

```ts
import { deleteData, getData, postData, putData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type {
	GiftEventBusinessInfo,
	GiftEventInfo,
	GiftEventQuery,
	GiftEventSummary,
	GiftEventTypeOptions,
} from '@/views/finance/gift/config';

const base = '/gift-event-info-t';
const pageUrl = () => `${baseService.finance}${base}/page`;
const listUrl = () => `${baseService.finance}${base}/list`;
const baseUrl = () => `${baseService.finance}${base}`;

export const getGiftEventPage = (
	params: GiftEventQuery | Partial<GiftEventInfo>,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftEventInfo>>> =>
	postData(pageUrl(), params, { pageNum: pageNum || 1, pageSize: pageSize || 10 });

export const getGiftEventBusinessPage = (
	params: GiftEventQuery,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftEventBusinessInfo>>> =>
	postData(`${baseUrl()}/business-page`, params, {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	});

export const getGiftEventSummary = (): Promise<ResponseBody<GiftEventSummary>> =>
	getData(`${baseUrl()}/summary`);

export const getGiftEventTypeOptions = (): Promise<ResponseBody<GiftEventTypeOptions>> =>
	getData(`${baseUrl()}/event-type-options`);

export const getGiftEventDetail = (id: string): Promise<ResponseBody<GiftEventInfo>> =>
	getData(baseUrl(), { id });

export const getGiftEventList = (
	params: GiftEventQuery | Partial<GiftEventInfo> = {},
): Promise<ResponseBody<GiftEventInfo[]>> => postData(listUrl(), params);

export const addGiftEvent = (params: GiftEventInfo): Promise<ResponseBody<GiftEventInfo>> =>
	postData(baseUrl(), params);

export const updateGiftEvent = (params: GiftEventInfo): Promise<ResponseBody<boolean>> =>
	putData(baseUrl(), params);

export const deleteGiftEvent = (ids: string): Promise<ResponseBody<boolean>> =>
	deleteData(baseUrl(), { ids });
```

- [ ] **Step 2: Create `useGiftEventTypeOptions.ts`**

镜像 `useGiftRelationOptions.ts` + PC `useGiftEventTypeOptions.ts`：

```ts
import { getGiftEventTypeOptions } from '@/views/finance/gift/event/api';
import {
	FALLBACK_GIFT_EVENT_OPTIONS,
	buildGiftEventTypeSelectOptions,
	findEventTypeOptionId,
	isPresetEventType as matchPresetEventType,
	mapEventTypeToFormFields as mapEventFields,
	eventLabel as resolveEventLabel,
	resolveEventPresetCode,
	toSelectOptions,
	type GiftEventFormState,
	type GiftEventInfo,
	type GiftEventTypeOptionItem,
	type GiftRelationSelectGroup,
} from '@/views/finance/gift/config';

// module-level refs + loadEventTypeOptions + return shape 同 PC
```

注意：mobile `toSelectOptions` 参数类型为 `GiftRelationOptionItem[]`；`GiftEventTypeOptionItem` 结构相同，可直接传入。若 TS 报错，将 `toSelectOptions` 参数放宽为 `{ id: string; name: string }[]`（本 Task 内允许小改）。

- [ ] **Step 3: Lint touched files**

```bash
npx eslint --max-warnings=0 "src/views/finance/gift/event/api/index.ts" "src/composables/useGiftEventTypeOptions.ts" "src/views/finance/gift/config.ts"
```

- [ ] **Step 4: Commit**

```bash
git add src/views/finance/gift/event/api/index.ts src/composables/useGiftEventTypeOptions.ts src/views/finance/gift/config.ts
git commit -m "feat(gift): wire event API and event type options composable"
```

---

### Task 3: List page parity

**Files:**
- Modify: `src/views/finance/gift/event/index.vue`（整体重写，去掉 popup 新增）

**Interfaces:**
- Consumes: Task 2 API + composable；`usePagination`；`formatMoney` / `eventLabel` / `eventStatusText` / `GIFT_EVENT_DETAIL_NAME`
- Produces: 可交互列表页（testid 齐全）

- [ ] **Step 1: Rewrite list template/logic**

对齐 `person/index.vue` 结构：

1. `van-search` `data-testid="gift-event-search"` → keyword → `refresh`
2. `gift-event-type-tags`：`quickEvents` toggle → `resolveFilterEventType` → `searchInfo.eventType`
3. 展开区：  
   - 类别：`van-cell` 打开 ActionSheet（`giftEventTypeOptions` / presets+customs 扁平或分组）  
   - 时间：`van-calendar` `type="range"`（参考 `financeManager/index.vue`）；confirm 后  
     `eventTimeStart = dayjs(start).startOf('day').format('YYYY-MM-DDTHH:mm:ss')`  
     `eventTimeEnd = dayjs(end).endOf('day').format('YYYY-MM-DDTHH:mm:ss')`  
   - 用 `@/utils/dayjs` 的 dayjs 或已有封装；禁止裸 `new Date` 拼串除非与现网一致
4. Summary `gift-event-summary`：三卡 `monthPendingCount` / `formatMoney(totalAmount)` / `activePersonCount`；`getGiftEventSummary`
5. `CommonPullRefresh` + `CommonList` + skeleton；`getGiftEventBusinessPage`；每条 `id: String(item.id)`
6. 卡片字段：名称；`eventLabel` · 时间；地点/状态/人数/总额；remark 截断  
7. `@click` → `gift:edit` 校验 → `router.push({ path: detailPath(), query: { id } })` + haptic  
8. NavBar 右「新增」仅 `gift:add` → `detailPath()` 无 id；`data-testid="gift-event-add"`  
9. `onMounted`：`loadEventTypeOptions`；若 `route.query.open === 'create'` 且有 add 权限则跳转详情新增并 `router.replace` 清 query  
10. 删除现有 `van-popup` 快速新增与搜索栏裸 `+`

关键逻辑片段：

```ts
const openDetail = (id?: string) => {
	if (!hasPermission('gift:edit')) {
		showFailToast('无编辑权限');
		return;
	}
	navigator.vibrate?.(50);
	router.push({ path: detailPath(), query: id ? { id: String(id) } : {} });
};
```

- [ ] **Step 2: Styles**

复用 `../shared.less` + person-summary / person-card 类名或 event 平行类；圆角 16；无 emoji。

- [ ] **Step 3: Lint**

```bash
npx eslint --max-warnings=0 "src/views/finance/gift/event/index.vue"
```

- [ ] **Step 4: Commit**

```bash
git add src/views/finance/gift/event/index.vue
git commit -m "feat(gift): rebuild mobile event list with summary and filters"
```

---

### Task 4: Form page + hidden menu SQL

**Files:**
- Create: `src/views/finance/gift/event/giftEventDetail/index.vue`
- Create (backend): `doc/sql/gift_event_detail_menu_20260727.sql`（或并入 `alex_finance_gift_management.sql` 一节，二选一：优先独立 migrate + greenfield 同步 INSERT）
- Modify greenfield SQL section if independent file used

**Interfaces:**
- Consumes: `canSaveGiftEvent`、`buildEventTypeForSave`、`mapEventTypeToFormFields`、event API、`useGiftEventTypeOptions`、`useNavBar`、`usePermission`
- Produces: 可保存/删除的表单页

- [ ] **Step 1: Menu SQL（backend repo）**

```sql
-- gift_event_detail_menu_20260727.sql
INSERT INTO `t_menu_info`
(`id`, `name`, `path`, `title`, `component`, `redirect`, `icon`, `hide_in_menu`, `parent_id`, `summary`, `status`, `creator`, `create_time`, `updater`, `update_time`, `deleter`, `delete_time`, `is_delete`, `operator`, `operate_time`, `order_by`, `show_in_home`, `permission_code`)
SELECT
  1900000000000001013,
  'giftEventDetail',
  '/finance/gift/event/giftEventDetail',
  '事由管理详情',
  '/src/views/finance/gift/event/giftEventDetail/index.vue',
  NULL,
  'giftEventDetail',
  '1',
  (SELECT `id` FROM `t_menu_info` WHERE `name` = 'gift' LIMIT 1),
  '礼尚往来事由管理详情',
  '1',
  NULL, NOW(), NULL, NULL, NULL, NULL, 0, NULL, NULL,
  31,
  '0',
  'gift:event'
WHERE NOT EXISTS (
  SELECT 1 FROM `t_menu_info` WHERE `name` = 'giftEventDetail'
);
```

（若 `@gift_menu_id` 变量在 greenfield 可用，并入 `alex_finance_gift_management.sql` 时改用变量，与 `giftPersonDetail` 块一致。）

Backend commit：

```bash
git add doc/sql/gift_event_detail_menu_20260727.sql doc/sql/alex_finance_gift_management.sql
git commit -m "chore(sql): add giftEventDetail hidden menu for mobile"
```

- [ ] **Step 2: Implement `giftEventDetail/index.vue`**

结构要点：

- NavBar：`title` 新增事由/编辑事由；返回列表 path
- 分组「基础信息」：名称*、类型*（is-link ActionSheet）、自定义类型（条件）
- 分组「更多信息」：事由时间（popup + `van-date-picker`，`columns-type` 含时分；确认后 `dayjs(...).format('YYYY-MM-DDTHH:mm:ss')`）、备注 textarea
- 吸底 `gift-event-save`：`:disabled="!canSaveGiftEvent(formState)"`；文案按 id
- 编辑态删除文案按钮 `gift-event-delete` + `showConfirmDialog`
- `loadForm`：`getGiftEventDetail` → `mapEventTypeToFormFields`；新增空表
- `toSavePayload`：剥离 `eventTypeMode`/`customEventType`；合并 `buildEventTypeForSave`
- 自定义类型校验：≤20；与 preset 名冲突 toast（对齐 PC）
- padding-bottom + safe-area；testid：`gift-event-form`、`gift-event-save`、`gift-event-delete`
- 无权限进页：新增无 `gift:add` / 编辑无 `gift:edit` → toast 回列表

- [ ] **Step 3: Lint form**

```bash
npx eslint --max-warnings=0 "src/views/finance/gift/event/giftEventDetail/index.vue"
```

- [ ] **Step 4: Mobile commit**

```bash
git add src/views/finance/gift/event/giftEventDetail/index.vue
git commit -m "feat(gift): add mobile event form page with sticky save"
```

---

### Task 5: Checklist + Midscene + docs + graphify

**Files:**
- Create: `tests/checklists/gift-event-mobile.md`
- Modify/Create: Midscene cases under `tests/midscene/`（按现有 gift smoke 结构追加 event 条目或独立 json）
- Modify: `feature.md`
- Run graphify；commit GRAPH_REPORT / graph.html / graph.json only

**Interfaces:**
- Consumes: 全功能可跑路径与 testid

- [ ] **Step 1: Checklist**

按 `tests/checklists/gift-person-mobile.md` 模板写 `gift-event-mobile.md`：七点法（eventName/type/time/remark/id）、状态机（无 profile）、权限矩阵、不测理由（profile/record picker/PC）。

- [ ] **Step 2: Midscene 抽样**

在现有 gift midscene cases 增加（或新文件）：

- smoke：打开 `/finance/gift/event`，断言 `[data-testid="gift-event-summary"]`、`gift-event-list` 可见  
- flow：点击 `gift-event-add` → 填名称/类型 → `gift-event-save` → `waitForResponse` 含 `gift-event-info-t` → 回列表  
- 清理：try/finally 调 delete API  

禁止中文精确匹配；用 testid。

- [ ] **Step 3: feature.md bullet**

```markdown
- 事由管理：摘要三卡、类型/时间筛选、business 列表；独立表单页支持类型 preset/自定义、事由时间、吸底保存与删除（对齐 PC）。
```

- [ ] **Step 4: graphify**

```bash
"C:\Users\Administrator\AppData\Local\Programs\Python\Python314\python.exe" -m graphify update src
npm run graphify:augment
```

- [ ] **Step 5: Commit**

```bash
git add tests/checklists/gift-event-mobile.md tests/midscene feature.md src/graphify-out/GRAPH_REPORT.md src/graphify-out/graph.html src/graphify-out/graph.json
git commit -m "docs(gift): add event mobile checklist and note feature parity"
```

---

## Spec Coverage Checklist

| Spec item | Task |
| --- | --- |
| Config / helpers / canSave | Task 1 |
| API + composable | Task 2 |
| List summary + filters + business + permissions + open=create | Task 3 |
| Form page CRUD + sticky + delete | Task 4 |
| Menu giftEventDetail | Task 4 |
| Checklist + Midscene + docs/graphify | Task 5 |
| 无 profile / 无 record picker | Global Constraints |

## Manual DB note

部署前在用户库执行 `gift_event_detail_menu_20260727.sql`（或 greenfield 已含时跳过），并刷新菜单/权限缓存，否则详情路由 404。
