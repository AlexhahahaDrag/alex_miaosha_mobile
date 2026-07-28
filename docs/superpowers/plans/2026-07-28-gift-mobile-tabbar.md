# Gift Mobile TabBar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 礼金四主页底部统一展示「亲友 / 事由 / 记账 / 分析」Tab，详情页隐藏，与财务 `useTabBar` 模式一致。

**Architecture:** 在 `gift/config.ts` 导出 `GIFT_TAB_BAR`；四主页 `useTabBar({ visible: true, data: GIFT_TAB_BAR })`；详情 `useTabBar({ visible: false })`。路由 name 与菜单 SQL 对齐：`giftPerson` / `giftEvent` / `giftRecord` / `giftAnalysis`。

**Tech Stack:** Vue 3 + Vant Tabbar + Pinia `useTabBar` + Vitest + Less

## Global Constraints

- Spec：`docs/superpowers/specs/2026-07-28-gift-mobile-tabbar-design.md`
- 仅四主页显示礼金底栏；`giftPersonDetail` / `giftEventDetail` 必须 `visible: false`
- 「记账」= `giftRecord`（`/finance/gift/record`）；dashboard 不进底栏
- Tab 短文案固定：亲友 / 事由 / 记账 / 分析（禁止 emoji）
- auto-import 的 Vue / Vant 勿手动 import
- 接口解构：`const { code, data, message } = await api()`
- ID 保持 string；不改后端
- 改 `src` 后执行 `npm run graphify:update`
- 提交英文 message；勿带 `Co-authored-by: Cursor`

---

## File Map

| File                                                       | Responsibility                                |
| ---------------------------------------------------------- | --------------------------------------------- |
| `src/views/finance/gift/config.ts`                         | 导出 `GIFT_TAB_BAR` + route name 常量         |
| `src/views/finance/gift/config.spec.ts`                    | 契约单测                                      |
| `src/views/common/tab-bar/index.vue`                       | 单项 `data-testid="tab-{name}"`（全模块通用） |
| `src/views/finance/gift/person/index.vue`                  | 挂礼金 Tab                                    |
| `src/views/finance/gift/event/index.vue`                   | 挂礼金 Tab                                    |
| `src/views/finance/gift/record/index.vue`                  | 挂礼金 Tab                                    |
| `src/views/finance/gift/analysis/index.vue`                | 挂礼金 Tab                                    |
| `src/views/finance/gift/person/giftPersonDetail/index.vue` | 隐藏底栏                                      |
| `src/views/finance/gift/event/giftEventDetail/index.vue`   | 隐藏底栏                                      |
| `DEVELOPMENT.md`                                           | 底栏约定一句                                  |
| `feature.md`                                               | 功能一句（若项目惯例需要）                    |

---

### Task 1: `GIFT_TAB_BAR` 契约（TDD）

**Files:**

- Modify: `src/views/finance/gift/config.ts`
- Test: `src/views/finance/gift/config.spec.ts`

**Interfaces:**

- Consumes: 无
- Produces:
  - `GIFT_PERSON_NAME = 'giftPerson'`
  - `GIFT_EVENT_NAME = 'giftEvent'`
  - `GIFT_RECORD_NAME = 'giftRecord'`
  - `GIFT_ANALYSIS_NAME = 'giftAnalysis'`
  - `GIFT_TAB_BAR: ReadonlyArray<{ name: string; title: string; icon: string }>` 顺序与文案锁定如下

- [ ] **Step 1: Write failing tests**

在 `config.spec.ts` 追加：

```ts
import {
	GIFT_ANALYSIS_NAME,
	GIFT_EVENT_NAME,
	GIFT_PERSON_NAME,
	GIFT_RECORD_NAME,
	GIFT_TAB_BAR,
} from './config';

describe('gift mobile tab bar', () => {
	it('exposes four tabs in order with locked titles and route names', () => {
		expect(GIFT_TAB_BAR.map((item) => item.title)).toEqual(['亲友', '事由', '记账', '分析']);
		expect(GIFT_TAB_BAR.map((item) => item.name)).toEqual([
			GIFT_PERSON_NAME,
			GIFT_EVENT_NAME,
			GIFT_RECORD_NAME,
			GIFT_ANALYSIS_NAME,
		]);
		expect(GIFT_PERSON_NAME).toBe('giftPerson');
		expect(GIFT_EVENT_NAME).toBe('giftEvent');
		expect(GIFT_RECORD_NAME).toBe('giftRecord');
		expect(GIFT_ANALYSIS_NAME).toBe('giftAnalysis');
		for (const item of GIFT_TAB_BAR) {
			expect(item.icon.length).toBeGreaterThan(0);
		}
	});
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: FAIL（`GIFT_TAB_BAR` / name 常量未导出）

- [ ] **Step 3: Minimal implementation in `config.ts`**

在现有 `GIFT_PERSON_DETAIL_NAME` / `GIFT_EVENT_DETAIL_NAME` 附近追加：

```ts
export const GIFT_PERSON_NAME = 'giftPerson';
export const GIFT_EVENT_NAME = 'giftEvent';
export const GIFT_RECORD_NAME = 'giftRecord';
export const GIFT_ANALYSIS_NAME = 'giftAnalysis';

/** 礼金子模块底栏（四主页 useTabBar.data） */
export const GIFT_TAB_BAR = [
	{ name: GIFT_PERSON_NAME, title: '亲友', icon: 'user-circle' },
	{ name: GIFT_EVENT_NAME, title: '事由', icon: 'dict' },
	{ name: GIFT_RECORD_NAME, title: '记账', icon: 'gift' },
	{ name: GIFT_ANALYSIS_NAME, title: '分析', icon: 'financeAnalysis' },
] as const;
```

（图标均已存在于 `src/assets/icons`；`tab-bar` 通过 `svg-icon` 解析。）

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/views/finance/gift/config.ts src/views/finance/gift/config.spec.ts
git commit -m "feat(gift): add GIFT_TAB_BAR contract for mobile module tabs"
```

---

### Task 2: TabBar 单项 testid（通用）

**Files:**

- Modify: `src/views/common/tab-bar/index.vue`

**Interfaces:**

- Consumes: 现有 `tabBarData` 项含 `name`
- Produces: 每个 `van-tabbar-item` 带 `data-testid="tab-{name}"`；根 `van-tabbar` 带 `data-testid="app-tabbar"`

- [ ] **Step 1: Patch template**

将根与 item 改为（保留其余属性）：

```vue
<van-tabbar
	v-model="curActive"
	route
	active-color="#1989fa"
	inactive-color="#969799"
	class="custom-tab-bar"
	data-testid="app-tabbar"
>
	<van-tabbar-item
		v-for="(item, index) in tabBarData"
		:to="item.to"
		:name="item?.name || ''"
		:key="index"
		:data-testid="`tab-${item.name}`"
	>
```

- [ ] **Step 2: Lint the file**

```bash
npx eslint --max-warnings=0 "src/views/common/tab-bar/index.vue"
```

Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add src/views/common/tab-bar/index.vue
git commit -m "test(ui): add data-testid on app tabbar items"
```

---

### Task 3: 四主页挂载礼金 Tab

**Files:**

- Modify: `src/views/finance/gift/person/index.vue`
- Modify: `src/views/finance/gift/event/index.vue`
- Modify: `src/views/finance/gift/record/index.vue`
- Modify: `src/views/finance/gift/analysis/index.vue`

**Interfaces:**

- Consumes: `useTabBar` from `@/composables/useTabBar`；`GIFT_TAB_BAR` from `@/views/finance/gift/config`
- Produces: 四页 `onMounted`/`onActivated` 写入同一底栏配置

- [ ] **Step 1: person/index.vue**

在 `useNavBar({...})` 之后增加（imports 区增加 `useTabBar` 与 `GIFT_TAB_BAR`，勿重复导入已 auto-import 的 Vue API）：

```ts
import { useTabBar } from '@/composables/useTabBar';
import {
	GIFT_PERSON_DETAIL_NAME,
	GIFT_TAB_BAR,
	directionText,
	formatMoney,
	personAvatarSrc,
} from '@/views/finance/gift/config';

useTabBar({
	visible: true,
	data: [...GIFT_TAB_BAR],
});
```

（若现有 import 行已从 config 解构，合并进同一 import。）

- [ ] **Step 2: event/index.vue**

同样在 `useNavBar` 后：

```ts
import { useTabBar } from '@/composables/useTabBar';
import { GIFT_TAB_BAR /* keep existing named imports */ } from '@/views/finance/gift/config';

useTabBar({
	visible: true,
	data: [...GIFT_TAB_BAR],
});
```

- [ ] **Step 3: record/index.vue**

```ts
import { useTabBar } from '@/composables/useTabBar';
import {
	GIFT_TAB_BAR,
	directionOptions,
	formatMoney,
	quickAmounts,
} from '@/views/finance/gift/config';

useTabBar({
	visible: true,
	data: [...GIFT_TAB_BAR],
});
```

顶栏标题可保留「礼金记录」（Tab 文案已是「记账」）。

- [ ] **Step 4: analysis/index.vue**

```ts
import { useTabBar } from '@/composables/useTabBar';
import { GIFT_TAB_BAR, directionText, formatMoney } from '@/views/finance/gift/config';

useTabBar({
	visible: true,
	data: [...GIFT_TAB_BAR],
});
```

- [ ] **Step 5: Lint touched pages**

```bash
npx eslint --max-warnings=0 "src/views/finance/gift/person/index.vue" "src/views/finance/gift/event/index.vue" "src/views/finance/gift/record/index.vue" "src/views/finance/gift/analysis/index.vue"
```

Expected: exit 0

- [ ] **Step 6: Hand-check list height（无代码则跳过）**

若列表底部被 tabbar 遮挡：layout 已有 `with-tabbar` `padding-bottom: 50px`；优先依赖它。仅当某页 `height: calc(100% - Xpx)` 仍裁切内容时，把 X 再加 50（例如 person 的 `.gift-refresh--person`）。不要四页无差别地乱改。

- [ ] **Step 7: Commit**

```bash
git add src/views/finance/gift/person/index.vue src/views/finance/gift/event/index.vue src/views/finance/gift/record/index.vue src/views/finance/gift/analysis/index.vue src/views/finance/gift/shared.less
git commit -m "feat(gift): wire module tab bar on four gift list pages"
```

---

### Task 4: 详情页隐藏底栏

**Files:**

- Modify: `src/views/finance/gift/person/giftPersonDetail/index.vue`
- Modify: `src/views/finance/gift/event/giftEventDetail/index.vue`

**Interfaces:**

- Consumes: `useTabBar`
- Produces: 详情生命周期内 `visible: false`

- [ ] **Step 1: giftPersonDetail**

```ts
import { useTabBar } from '@/composables/useTabBar';

useTabBar({
	visible: false,
});
```

放在 `useNavBar` / `setNavBar` 初始化附近即可。

- [ ] **Step 2: giftEventDetail**

```ts
import { useTabBar } from '@/composables/useTabBar';

useTabBar({
	visible: false,
});
```

- [ ] **Step 3: Lint**

```bash
npx eslint --max-warnings=0 "src/views/finance/gift/person/giftPersonDetail/index.vue" "src/views/finance/gift/event/giftEventDetail/index.vue"
```

Expected: exit 0

- [ ] **Step 4: Commit**

```bash
git add src/views/finance/gift/person/giftPersonDetail/index.vue src/views/finance/gift/event/giftEventDetail/index.vue
git commit -m "feat(gift): hide tab bar on gift detail pages"
```

---

### Task 5: 文档 + graphify + 验收

**Files:**

- Modify: `DEVELOPMENT.md`
- Modify: `feature.md`（若已有礼金条目则追加一句；无则跳过新建大段）

- [ ] **Step 1: DEVELOPMENT.md**

在礼金相关段落追加一句：

```md
- 礼金子模块四主页（亲友/事由/记账/分析）通过 `useTabBar` + `GIFT_TAB_BAR` 替换底栏；详情页 `visible: false`。
```

- [ ] **Step 2: feature.md**

追加或更新一句：移动端礼金模块底栏可在亲友/事由/记账/分析间切换。

- [ ] **Step 3: graphify**

```bash
npm run graphify:update
```

Expected: graph 更新成功（允许 synthetic node warning）

- [ ] **Step 4: Unit + lint smoke**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
npx eslint --max-warnings=0 "src/views/finance/gift/config.ts" "src/views/finance/gift/person/index.vue" "src/views/finance/gift/event/index.vue" "src/views/finance/gift/record/index.vue" "src/views/finance/gift/analysis/index.vue"
```

Expected: PASS / exit 0

- [ ] **Step 5: Manual acceptance**

1. 打开亲友管理 → 底栏为 亲友/事由/记账/分析；`data-testid=tab-giftPerson` 等存在
2. 点事由/记账/分析 → 页面与高亮正确
3. 进联系人详情 / 事由详情 → 无礼金底栏
4. 返回列表 → 底栏恢复
5. 进入财务信息 → 底栏变为财务模块 Tab（不被礼金污染）

- [ ] **Step 6: Commit**

```bash
git add DEVELOPMENT.md feature.md src/graphify-out
git commit -m "docs(gift): document mobile gift module tab bar"
```

---

## Spec coverage checklist

| Spec 要求                   | Task          |
| --------------------------- | ------------- |
| `GIFT_TAB_BAR` 公共配置     | Task 1        |
| 四主页 useTabBar            | Task 3        |
| 详情 visible false          | Task 4        |
| 记账=giftRecord；短文案     | Task 1        |
| testid                      | Task 2        |
| 高度 / with-tabbar          | Task 3 Step 6 |
| DEVELOPMENT / graphify      | Task 5        |
| 单测契约                    | Task 1        |
| 不改后端 / dashboard 不进栏 | 全任务遵守    |

## Placeholder / consistency self-review

- 无 TBD；route name 已与 `alex_finance_gift_management.sql` 对齐
- Icon 已定为现有资源名
- `GIFT_TAB_BAR` 在 Task 1 定义，Task 3 消费同一符号
