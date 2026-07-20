# Mobile 亲友管理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `alex_miaosha_mobile` 对齐 PC 亲友管理：业务列表、汇总、关系筛选、CRUD、档案详情，并接入 `gift:view/add/edit/delete`。

**Architecture:** 领域层（config/api/composables）镜像 PC 契约；路由/文件严格对齐 `t_menu_info`（列表 `giftPerson` + 隐藏详情 `giftPersonDetail`）；列表用 `business-page`，详情单页切换档案/表单模式。

**Tech Stack:** Vue 3 + Vant 4 + Pinia + TypeScript + Vite；Midscene + Playwright；单元测试用 Vitest。

**Spec:** `docs/superpowers/specs/2026-07-20-gift-person-mobile-design.md`

## Global Constraints

- ID 一律 `string`，禁止 `number`；响应侧 `normalizeGiftIds` 递归转 string
- API 响应解构：`const { code, data, message } = await api()`
- 已由 auto-import 的 Vue API / Vant / `src/views/components/*` 禁止手动 import
- 列表必须用 `CommonPullRefresh` + `CommonList` + `usePagination`
- 导航详情用 `getRoutePathByName(router, 'giftPersonDetail')`，禁止写死 path 字符串散落
- 不做导出、批量标签；不改后端 API 契约
- Windows 提交信息用英文，禁止 `Co-authored-by: Cursor`
- 改 `src` 后跑 `npm run graphify:update`；同步 `DEVELOPMENT.md` / `feature.md`

---

## File Map

| 文件 | 职责 |
|------|------|
| `src/views/finance/gift/config.ts` | 类型、关系工具、金额/方向文案、路径常量 |
| `src/views/finance/gift/api/index.ts` | person API + `normalizeGiftIds` |
| `src/utils/permission/index.ts` | 权限上下文归一化 / Set / canAccess |
| `src/store/modules/user/user.ts` | `getPermissionContext` getter |
| `src/composables/usePermission.ts` | `hasPermission` |
| `src/composables/useGiftRelationOptions.ts` | 关系选项加载与映射 |
| `src/views/finance/gift/person/index.vue` | 列表页 |
| `src/views/finance/gift/person/giftPersonDetail/index.vue` | 详情档案/表单 |
| `../../backend/alex_miaosha/doc/sql/gift_person_detail_menu_20260720.sql` | `t_menu_info` 增量 |
| `tests/checklists/gift-person-mobile.md` | 测试 checklist |
| `tests/midscene/gift/cases/*.json` | Midscene 用例 |
| `DEVELOPMENT.md` / `feature.md` | 文档同步 |

---

### Task 1: Config 类型与纯函数 + Vitest

**Files:**
- Modify: `src/views/finance/gift/config.ts`
- Create: `src/views/finance/gift/config.spec.ts`
- Modify: `package.json`（加 `vitest` + `test:unit`）

**Interfaces:**
- Produces: `GiftId`, `GiftPersonBusinessInfo`, `GiftPersonSummary`, `GiftPersonProfile`, `GiftPersonQuery`, `GiftPersonRelationOptions`, `GiftRelationOptionItem`, `GiftPersonFormState`, `RELATION_CUSTOM`, `FALLBACK_GIFT_RELATION_OPTIONS`, `GIFT_PERSON_PATH`, `GIFT_PERSON_DETAIL_NAME`, `resolvePresetCode`, `mapRelationToFormFields`, `buildRelationTypeForSave`, `relationLabel`, `directionLabel`, `formatMoney`（保留现有别名兼容）

- [ ] **Step 1: 安装 Vitest**

```bash
npm i -D vitest
```

在 `package.json` scripts 增加：`"test:unit": "vitest run"`。

- [ ] **Step 2: 写失败单测**

`src/views/finance/gift/config.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
	RELATION_CUSTOM,
	buildRelationTypeForSave,
	mapRelationToFormFields,
	relationLabel,
	resolvePresetCode,
	FALLBACK_GIFT_RELATION_OPTIONS,
} from './config';

describe('gift person relation helpers', () => {
	it('resolvePresetCode maps 亲属 id to RELATIVE', () => {
		expect(resolvePresetCode('9000000000000000001')).toBe('RELATIVE');
	});

	it('mapRelationToFormFields uses CUSTOM for unknown relation', () => {
		const form = mapRelationToFormFields({ relationType: '发小' });
		expect(form.relationMode).toBe(RELATION_CUSTOM);
		expect(form.customRelation).toBe('发小');
	});

	it('buildRelationTypeForSave returns relationOptionId for preset mode', () => {
		const payload = buildRelationTypeForSave({
			relationMode: '9000000000000000002',
		});
		expect(payload).toEqual({ relationOptionId: '9000000000000000002' });
	});

	it('relationLabel resolves RELATIVE to 亲属', () => {
		expect(relationLabel('RELATIVE', FALLBACK_GIFT_RELATION_OPTIONS)).toBe('亲属');
	});
});
```

- [ ] **Step 3: 跑测确认失败**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: FAIL（缺少导出函数）

- [ ] **Step 4: 扩展 `config.ts`**

在现有文件上追加/替换（保留 `directionOptions` / `formatMoney` / `directionText` 兼容 record 页）：

```ts
export type GiftId = string;
export type GiftPersonScope = 'CONTACT' | 'ORG_MEMBER' | 'ALL';

export interface GiftPersonInfo {
	id?: GiftId;
	orgId?: GiftId;
	userId?: GiftId;
	bindUserId?: GiftId;
	personName?: string;
	phone?: string;
	relationType?: string;
	relationOptionId?: string;
	remark?: string;
	createTime?: string;
	totalGiveAmount?: number;
	totalReceiveAmount?: number;
}

export interface GiftPersonBusinessInfo extends GiftPersonInfo {
	netAmount?: number;
	latestRecordTime?: string;
	latestEventName?: string;
	latestDirection?: GiftDirection;
	pendingReturnAmount?: number;
}

export interface GiftPersonSummary {
	personCount?: number;
	yearTotalAmount?: number;
	pendingReturnAmount?: number;
}

export interface GiftPersonProfile {
	person?: GiftPersonBusinessInfo;
	records?: GiftRecordInfo[];
}

export interface GiftPersonQuery {
	keyword?: string;
	relationType?: string;
	personScope?: GiftPersonScope;
}

export interface GiftRelationOptionItem {
	id: string;
	name: string;
}

export interface GiftPersonRelationOptions {
	presets?: GiftRelationOptionItem[];
	customs?: GiftRelationOptionItem[];
}

export interface GiftRelationSelectOption {
	label: string;
	value: string;
}

export interface GiftRelationSelectGroup {
	label: string;
	options: GiftRelationSelectOption[];
}

export interface GiftPersonFormState extends GiftPersonInfo {
	relationMode?: string;
	customRelation?: string;
}

export const GIFT_PERSON_PATH = '/finance/gift/person';
export const GIFT_PERSON_DETAIL_NAME = 'giftPersonDetail';

export const FALLBACK_GIFT_RELATION_OPTIONS: GiftRelationOptionItem[] = [
	{ id: '9000000000000000001', name: '亲属' },
	{ id: '9000000000000000002', name: '朋友' },
	{ id: '9000000000000000003', name: '同事' },
	{ id: '9000000000000000004', name: '邻里' },
	{ id: '9000000000000000005', name: '其他' },
];

export const RELATION_CUSTOM = 'CUSTOM';

const PRESET_NAME_TO_CODE: Record<string, string> = {
	亲属: 'RELATIVE',
	朋友: 'FRIEND',
	同事: 'COLLEAGUE',
	邻里: 'NEIGHBOR',
	其他: 'OTHER',
};

// 从 PC config 拷贝：toSelectOptions / resolvePresetCode / buildGiftRelationSelectOptions /
// isPresetRelationType / findOptionIdByRelationType / mapRelationToFormFields /
// buildRelationTypeForSave / relationLabel
// directionLabel 可与 directionText 等价：label 用中文文案
```

将 `GiftPersonInfo.id` 从 `string | number` 改为 `GiftId`（`string`）；`GiftEventInfo` / `GiftRecordInfo` 的 `*Id` 同步改为 `GiftId`。

- [ ] **Step 5: 跑测通过**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/views/finance/gift/config.ts src/views/finance/gift/config.spec.ts
git commit -m "feat(gift): add person types and relation helpers with unit tests"
```

---

### Task 2: API 层对齐 PC（含 normalizeGiftIds）

**Files:**
- Modify: `src/views/finance/gift/api/index.ts`
- Create: `src/views/finance/gift/api/normalizeGiftIds.spec.ts`

**Interfaces:**
- Consumes: Task1 类型
- Produces: `normalizeGiftIds`, `getGiftPersonBusinessPage`, `getGiftPersonSummary`, `getGiftPersonProfile`, `getGiftPersonRelationOptions`, `getGiftPersonDetail`, `updateGiftPerson`, `deleteGiftPerson`；保留/改写现有 `getGiftPersonPage` / `addGiftPerson` / `getGiftPersonList`

- [ ] **Step 1: 写失败单测**

```ts
import { describe, expect, it } from 'vitest';
import { normalizeGiftIds } from './index';

describe('normalizeGiftIds', () => {
	it('stringifies id and *Id fields recursively', () => {
		const input = {
			id: 1900000000000001002,
			giverPersonId: 9001n,
			nested: { eventId: 42, name: 'x' },
			list: [{ receiverPersonId: 7 }],
		};
		const out = normalizeGiftIds(input);
		expect(out.id).toBe('1900000000000001002');
		expect(out.giverPersonId).toBe('9001');
		expect(out.nested.eventId).toBe('42');
		expect(out.list[0].receiverPersonId).toBe('7');
		expect(out.nested.name).toBe('x');
	});
});
```

- [ ] **Step 2: 跑测失败**

```bash
npm run test:unit -- src/views/finance/gift/api/normalizeGiftIds.spec.ts
```

Expected: FAIL（未导出）

- [ ] **Step 3: 实现 API**

按 PC `alex_miaosha_front/src/views/finance/gift/api/index.ts` 移植 person 段：

```ts
export function normalizeGiftIds<T>(value: T): T { /* 同 PC */ }

function normalizeGiftResponse<T>(response: ResponseBody<T>): ResponseBody<T> {
	if (!response.data) return response;
	return { ...response, data: normalizeGiftIds(response.data) };
}

export const getGiftPersonBusinessPage = (params, pageNum?, pageSize?) =>
	postData(`${baseUrl(api.person)}/business-page`, normalizeGiftIds(params), {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	}).then(normalizeGiftResponse);

export const getGiftPersonSummary = () =>
	getData(`${baseUrl(api.person)}/summary`);

export const getGiftPersonProfile = (id: string) =>
	getData(`${baseUrl(api.person)}/profile`, { id }).then(normalizeGiftResponse);

export const getGiftPersonRelationOptions = (personId?: string) =>
	getData(`${baseUrl(api.person)}/relation-options`, personId ? { personId } : {});

export const getGiftPersonDetail = (id: string) =>
	getData(baseUrl(api.person), { id }).then(normalizeGiftResponse);

export const updateGiftPerson = (params: GiftPersonInfo) =>
	putData(baseUrl(api.person), normalizeGiftIds(params));

export const deleteGiftPerson = (ids: string) =>
	deleteData(baseUrl(api.person), { ids });
```

注意：mobile 用 `getData`（无 `getDataOne`）。`addGiftPerson` / `getGiftPersonPage` / `getGiftPersonList` 补上 `.then(normalizeGiftResponse)` 与入参 `normalizeGiftIds`。

- [ ] **Step 4: 跑测通过 + Commit**

```bash
npm run test:unit -- src/views/finance/gift/api/normalizeGiftIds.spec.ts
git add src/views/finance/gift/api/
git commit -m "feat(gift): align person APIs with ID normalization"
```

---

### Task 3: 权限基建 `usePermission`

**Files:**
- Modify: `src/utils/permission/index.ts`
- Modify: `src/store/modules/user/user.ts`
- Modify: `src/store/modules/user/typing.ts`（如需）
- Create: `src/composables/usePermission.ts`
- Create: `src/utils/permission/permission.spec.ts`

**Interfaces:**
- Consumes: login `admin` / `roleInfo.permissionList`
- Produces: `normalizePermissionContext`, `buildPermissionSet`, `canAccessPermission`, `isSuperAdmin`, `usePermission().hasPermission`

- [ ] **Step 1: 写失败单测**

```ts
import { describe, expect, it } from 'vitest';
import {
	buildPermissionSet,
	canAccessPermission,
	isSuperAdmin,
	normalizePermissionContext,
} from './index';

describe('permission utils', () => {
	it('super_super bypasses permission check', () => {
		const ctx = normalizePermissionContext({
			roleInfoVo: { roleCode: 'super_super', permissionList: [] },
		});
		expect(isSuperAdmin(ctx)).toBe(true);
		expect(canAccessPermission(buildPermissionSet(ctx), 'gift:edit', true)).toBe(true);
	});

	it('hasPermission false when code missing', () => {
		const ctx = normalizePermissionContext({
			roleInfoVo: {
				roleCode: 'gift_user',
				permissionList: [{ permissionCode: 'gift:view' }],
			},
		});
		const set = buildPermissionSet(ctx);
		expect(canAccessPermission(set, 'gift:edit', false)).toBe(false);
		expect(canAccessPermission(set, 'gift:view', false)).toBe(true);
	});
});
```

- [ ] **Step 2: 跑测失败 → 从 PC 移植 `normalizePermissionContext` / `buildPermissionSet` / `canAccessPermission` / `isSuperAdmin` 到 mobile `utils/permission/index.ts`，保留现有 `buildPermissionContext`（菜单用）**

- [ ] **Step 3: userStore 增加 getter**

```ts
getPermissionContext(): PermissionContext | null {
	const admin = this.userInfo;
	if (!admin) return null;
	return normalizePermissionContext({
		...(admin as object),
		roleInfoVo: this.roleInfo || undefined,
		roleInfoVoList: this.roleInfo ? [this.roleInfo] : [],
		menuInfoVoList: this.menuInfo || [],
		orgInfoVo: this.orgInfo,
	});
}
```

- [ ] **Step 4: 新增 composable**

```ts
// src/composables/usePermission.ts
import { useUserStore } from '@/store/modules/user/user';
import {
	buildPermissionSet,
	canAccessPermission,
	isSuperAdmin as judgeSuperAdmin,
} from '@/utils/permission';

export const usePermission = () => {
	const userStore = useUserStore();
	const context = computed(() => userStore.getPermissionContext);
	const permissionSet = computed(() => buildPermissionSet(context.value));
	const hasPermission = (permissionCode?: string) =>
		canAccessPermission(
			permissionSet.value,
			permissionCode,
			judgeSuperAdmin(context.value),
		);
	return {
		permissionContext: context,
		permissionSet,
		hasPermission,
		isSuperAdmin: computed(() => judgeSuperAdmin(context.value)),
	};
};
```

- [ ] **Step 5: 测通 + Commit**

```bash
npm run test:unit -- src/utils/permission/permission.spec.ts
git add src/utils/permission src/composables/usePermission.ts src/store/modules/user
git commit -m "feat: add usePermission for gift button codes"
```

---

### Task 4: `useGiftRelationOptions`

**Files:**
- Create: `src/composables/useGiftRelationOptions.ts`

**Interfaces:**
- Consumes: `getGiftPersonRelationOptions`, Task1 helpers
- Produces: 与 PC 同名返回值：`loadRelationOptions`, `relationLabel`, `quickRelations`, `mapRelationToFormFields`, `resolveFilterRelationType`, `presetOptions`, `relationSelectOptions`

- [ ] **Step 1: 从 PC `src/composables/useGiftRelationOptions.ts` 原样移植，仅改 import 路径到 mobile gift api/config**

- [ ] **Step 2: 手测/类型检查**

```bash
npx vue-tsc --noEmit 2>&1 | Select-String "useGiftRelationOptions|gift/config" | Select-Object -First 20
```

（若项目无 `vue-tsc` 脚本，改跑 `npm run lint` 并确认无新增报错。）

- [ ] **Step 3: Commit**

```bash
git add src/composables/useGiftRelationOptions.ts
git commit -m "feat(gift): add useGiftRelationOptions composable"
```

---

### Task 5: 列表页 `person/index.vue`

**Files:**
- Modify: `src/views/finance/gift/person/index.vue`
- Modify: `src/views/finance/gift/shared.less`（如需卡片样式）

**Interfaces:**
- Consumes: `getGiftPersonBusinessPage`, `getGiftPersonSummary`, `useGiftRelationOptions`, `usePermission`, `GIFT_PERSON_DETAIL_NAME`, `getRoutePathByName`

- [ ] **Step 1: 删除页内 Popup 快速新增；改为路由跳转详情**

关键逻辑骨架：

```ts
import { showFailToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import { usePermission } from '@/composables/usePermission';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { getRoutePathByName } from '@/utils/router';
import {
	getGiftPersonBusinessPage,
	getGiftPersonSummary,
} from '@/views/finance/gift/api';
import type { GiftPersonBusinessInfo, GiftPersonQuery, GiftPersonSummary } from '@/views/finance/gift/config';
import {
	GIFT_PERSON_DETAIL_NAME,
	directionText,
	formatMoney,
	relationLabel as resolveRelationFallback,
} from '@/views/finance/gift/config';

const router = useRouter();
const { hasPermission } = usePermission();
const {
	quickRelations,
	loadRelationOptions,
	relationLabel,
	resolveFilterRelationType,
} = useGiftRelationOptions();

const detailPath = () => getRoutePathByName(router, GIFT_PERSON_DETAIL_NAME);

const openCreate = () => {
	if (!hasPermission('gift:add')) return;
	navigator.vibrate?.(50);
	router.push({ path: detailPath() });
};

const openDetail = (id?: string) => {
	if (!id || !hasPermission('gift:view')) return;
	navigator.vibrate?.(50);
	router.push({ path: detailPath(), query: { id: String(id) } });
};

useNavBar({
	title: '亲友管理',
	rightButton: hasPermission('gift:add') ? '新增' : '',
	visible: true,
	onRightClick: openCreate,
});
```

模板要点：
- `data-testid="gift-person-search"` / `gift-person-list` / `gift-person-card` / `gift-person-relation-tag`
- 汇总区：`summary.personCount` / `yearTotalAmount` / `pendingReturnAmount`
- 卡片展示 `formatMoney(totalGiveAmount/totalReceiveAmount)`、`latestRecordTime`、`relationLabel(relationType)`
- `load` 调 `getGiftPersonBusinessPage(searchInfo, current, pageSize)`
- `onMounted`: `loadRelationOptions(); refresh()`

- [ ] **Step 2: 去掉手动 `import CommonPullRefresh/CommonList`（靠 auto-import）**

- [ ] **Step 3: `npm run lint` 无错**

- [ ] **Step 4: Commit**

```bash
git add src/views/finance/gift/person/index.vue src/views/finance/gift/shared.less
git commit -m "feat(gift): upgrade mobile person list with business page"
```

---

### Task 6: 详情页 `giftPersonDetail`

**Files:**
- Create: `src/views/finance/gift/person/giftPersonDetail/index.vue`

**Interfaces:**
- Consumes: profile/detail/add/update/delete API、`useGiftRelationOptions`、`usePermission`、`buildRelationTypeForSave`

- [ ] **Step 1: 新建页面**

行为：
- `route.query.id` 无 → `mode='form'` 新增
- 有 id → 默认 `mode='profile'`；点编辑 → `mode='form'` 并 `getGiftPersonDetail`
- NavBar：`leftPath` 用 `getRoutePathByName(router, 'giftPerson')`；标题随模式变
- 档案：profile API；往来用 `directionText` + `formatMoney`
- 表单：姓名必填；手机可选校验 `^1[3-9]\d{9}$`；关系 `van-popup` + `van-picker`（扁平化 `relationSelectOptions`）；自定义关系字段
- 保存：`toSavePayload` = 去 `relationMode/customRelation` + `buildRelationTypeForSave`；成功回列表
- 删除：`showConfirmDialog` → `deleteGiftPerson(String(id))`
- `data-testid`: `gift-person-detail`, `gift-person-edit`, `gift-person-delete`, `gift-person-save`, `gift-person-form`

权限：无 `gift:view` 且有 id → toast 后回列表；按钮按码显隐。

参考 PC `gift-person-detail/index.vue` 的 `toSavePayload` / `loadProfile` / `loadForm` 逻辑，UI 用 Vant。

- [ ] **Step 2: lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/views/finance/gift/person/giftPersonDetail/
git commit -m "feat(gift): add giftPersonDetail profile and form page"
```

---

### Task 7: `t_menu_info` SQL + 文档

**Files:**
- Create: `f:/workplace/project/myself/backend/alex_miaosha/doc/sql/gift_person_detail_menu_20260720.sql`
- Modify: `DEVELOPMENT.md`（§9 亲友管理补充）
- Modify: `feature.md`（亲友管理能力说明）

- [ ] **Step 1: 写 SQL**

```sql
USE alex_user;
SET NAMES utf8mb4;

-- giftPersonDetail: hide_in_menu=1, parent=礼尚往来顶级菜单
INSERT INTO `t_menu_info`
(`id`, `name`, `path`, `title`, `component`, `redirect`, `icon`, `hide_in_menu`, `parent_id`, `summary`, `status`, `creator`, `create_time`, `updater`, `update_time`, `deleter`, `delete_time`, `is_delete`, `operator`, `operate_time`, `order_by`, `show_in_home`, `permission_code`)
SELECT
  1900000000000001012,
  'giftPersonDetail',
  '/finance/gift/person/giftPersonDetail',
  '亲友管理详情',
  '/src/views/finance/gift/person/giftPersonDetail/index.vue',
  NULL,
  'giftPersonDetail',
  '1',
  1900000000000001000,
  '礼尚往来亲友管理详情',
  '1',
  NULL, NOW(), NULL, NULL, NULL, NULL, 0, NULL, NULL,
  21,
  '0',
  'gift:person'
WHERE NOT EXISTS (
  SELECT 1 FROM `t_menu_info` WHERE `name` = 'giftPersonDetail'
);
```

- [ ] **Step 2: 文档补一段「亲友管理：列表 business-page + giftPersonDetail 档案/表单；权限 gift:view/add/edit/delete」**

- [ ] **Step 3: Commit（分仓）**

Mobile:

```bash
git add DEVELOPMENT.md feature.md
git commit -m "docs(gift): document mobile person management"
```

Backend（若该仓可写）：

```bash
cd f:/workplace/project/myself/backend/alex_miaosha
git add doc/sql/gift_person_detail_menu_20260720.sql
git commit -m "chore(sql): add giftPersonDetail menu for mobile"
```

---

### Task 8: Checklist + Midscene

**Files:**
- Create: `tests/checklists/gift-person-mobile.md`
- Modify: `tests/midscene/gift/cases/mobile-smoke.json`（或新增 `person-flow.json`）
- Modify: `scripts/midscene/run-gift-smoke.mjs`（若需加载新 case 文件）

- [ ] **Step 1: Checklist** 按 `backend/tests/checklists/gift.md` 样板缩写，至少含：
  - 字段七点（personName/phone/relationType/remark/id）
  - 状态：档案 ↔ 表单
  - 权限矩阵 gift:view/add/edit/delete
  - 不测理由：导出、批量标签

- [ ] **Step 2: Midscene case**

```json
{
  "caseId": "GIFT-MOBILE-PERSON-001",
  "title": "亲友管理列表加载 business-page",
  "route": "/finance/gift/person",
  "level": "smoke",
  "waitFor": "/gift-person-info-t/business-page"
},
{
  "caseId": "GIFT-MOBILE-PERSON-002",
  "title": "亲友新增-详情-编辑流程",
  "route": "/finance/gift/person",
  "level": "flow",
  "persona": "gift_admin"
}
```

断言用 `data-testid`，禁止中文文案精确匹配；等待用 `waitForResponse`。

- [ ] **Step 3: Commit**

```bash
git add tests/
git commit -m "test(gift): add person mobile checklist and midscene cases"
```

---

### Task 9: 验收收尾

**Files:** 无新文件；跑命令

- [ ] **Step 1: 单元测试全量**

```bash
npm run test:unit
```

Expected: 全部 PASS

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: 0 errors

- [ ] **Step 3: Graphify**

```bash
npm run graphify:update
```

- [ ] **Step 4: 手工冒烟清单**
  1. 登录有 `gift:person` 账号 → 打开亲友列表有汇总与卡片
  2. 关系 tag 筛选后列表变化
  3. 新增保存后出现在列表，id 为字符串
  4. 详情见往来历史；编辑保存生效
  5. 删除确认后列表消失
  6. 无 `gift:edit` 账号看不到编辑按钮（可用只读角色）

- [ ] **Step 5: 若 graphify 有 diff，一并 commit**

```bash
git add src/graphify-out
git commit -m "chore: update graphify after gift person mobile"
```

---

## Self-Review (plan vs spec)

| Spec 要求 | Task |
|-----------|------|
| business-page 列表 + 汇总 + 关系筛选 | Task 5 |
| giftPersonDetail 档案/表单/删除 | Task 6 |
| API/normalizeGiftIds/类型 | Task 1–2 |
| usePermission + gift:view/add/edit/delete | Task 3, 5–6 |
| useGiftRelationOptions | Task 4 |
| t_menu_info 隐藏菜单 | Task 7 |
| checklist + Midscene | Task 8 |
| 不做导出/批量标签 | 全任务未包含 |
| DEVELOPMENT/feature/graphify | Task 7, 9 |

无 TBD；命名与 Task 间接口一致（`GIFT_PERSON_DETAIL_NAME='giftPersonDetail'`、`normalizeGiftIds`、`hasPermission`）。
