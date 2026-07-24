# Gift Person Detail Privacy UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 联系人详情 profile：去重信息、手机号默认脱敏+显隐/拨号/复制、备注折叠、往来时间格式化为 `YYYY-MM-DD HH:mm`。

**Architecture:** 纯函数进 `gift/config.ts`（可单测）；UI/浏览器 API 留在 `giftPersonDetail/index.vue`。复用 `@/utils/dayjs` 的 `formatTime` + `dataTimeFormat`。不新建全局组件、不改 layout/表单模式。

**Tech Stack:** Vue 3 SFC + Vant + Vitest + dayjs 封装

## Global Constraints

- 仅改 profile 模式；编辑/新增 form 仍明文，不在本计划。
- 手机号默认 `phoneVisible = false`；11 位脱敏格式精确为 `182 **** 2222`（空格分隔）。
- 图标用 Vant（`eye-o` / `closed-eye` / `phone-o` / `records` 或 `description` 作复制），禁止 emoji。
- data-testid 必须：`gift-person-phone-toggle` / `gift-person-phone-call` / `gift-person-phone-copy` / `gift-person-remark-toggle`。
- 备注折叠阈值：`trim` 后长度 `> 60`。
- 时间：`formatTime(payTime, dataTimeFormat)` → `YYYY-MM-DD HH:mm`。
- 前端 ID 保持 string；API 解构 `const { code, data, message } = await ...`。
- 已由 auto-import 的 Vue API / Vant 组件勿手动 import。
- 改 `src` 后跑 `npm run graphify:update`（Python 3.14 路径若 PATH 无模块）。
- 提交英文 message；勿主动加 `Co-authored-by: Cursor`（环境注入可记备注）。
- 非目标：历史分页、「全部」、删除样式、吸底 safe-area、金额徽标。

---

## File Map

| File | Responsibility |
|---|---|
| `src/views/finance/gift/config.ts` | `maskPhone` / `shouldCollapseRemark` / `collapseRemark` |
| `src/views/finance/gift/config.spec.ts` | 上述函数 Vitest |
| `src/views/finance/gift/person/giftPersonDetail/index.vue` | profile UI + 拨号/复制/显隐/折叠/时间 |
| `feature.md`（可选一句） | 隐私展示行为备忘 |

---

### Task 1: Phone/remark helpers (TDD)

**Files:**
- Modify: `src/views/finance/gift/config.ts`
- Test: `src/views/finance/gift/config.spec.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `maskPhone(phone?: string): string`
  - `shouldCollapseRemark(text?: string, limit = 60): boolean`
  - `collapseRemark(text?: string, limit = 60): string` — 折叠时取 `trim` 后前 `limit` 字 + `…`；不折叠则返回原 `trim` 文本（空 → `''`）

- [ ] **Step 1: Write failing tests**

在 `config.spec.ts` 追加：

```ts
import { maskPhone, shouldCollapseRemark, collapseRemark } from './config';

describe('gift person privacy helpers', () => {
	it('maskPhone masks 11-digit china mobile', () => {
		expect(maskPhone('18222222222')).toBe('182 **** 2222');
	});

	it('maskPhone returns empty for empty input', () => {
		expect(maskPhone('')).toBe('');
		expect(maskPhone(undefined)).toBe('');
	});

	it('maskPhone keeps non-11-digit as-is', () => {
		expect(maskPhone('12345')).toBe('12345');
	});

	it('shouldCollapseRemark uses trim length > 60', () => {
		expect(shouldCollapseRemark('a'.repeat(60))).toBe(false);
		expect(shouldCollapseRemark('a'.repeat(61))).toBe(true);
		expect(shouldCollapseRemark(`  ${'a'.repeat(61)}  `)).toBe(true);
	});

	it('collapseRemark truncates with ellipsis when over limit', () => {
		const text = 'a'.repeat(61);
		expect(collapseRemark(text)).toBe(`${'a'.repeat(60)}…`);
		expect(collapseRemark('short')).toBe('short');
	});
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: FAIL — `maskPhone` / helpers not exported.

- [ ] **Step 3: Implement helpers in config.ts**

```ts
const CHINA_MOBILE_11 = /^1[3-9]\d{9}$/;

export function maskPhone(phone?: string): string {
	const value = phone?.trim() ?? '';
	if (!value) return '';
	if (!CHINA_MOBILE_11.test(value)) return value;
	return `${value.slice(0, 3)} **** ${value.slice(7)}`;
}

export function shouldCollapseRemark(text?: string, limit = 60): boolean {
	return (text?.trim().length ?? 0) > limit;
}

export function collapseRemark(text?: string, limit = 60): string {
	const value = text?.trim() ?? '';
	if (value.length <= limit) return value;
	return `${value.slice(0, limit)}…`;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: all tests in file PASS (existing relation + new privacy).

- [ ] **Step 5: Commit**

```bash
git add src/views/finance/gift/config.ts src/views/finance/gift/config.spec.ts
git commit -m "feat(gift): add maskPhone and remark collapse helpers"
```

---

### Task 2: Profile UI — header privacy actions + remark + time

**Files:**
- Modify: `src/views/finance/gift/person/giftPersonDetail/index.vue`

**Interfaces:**
- Consumes: `maskPhone`, `shouldCollapseRemark`, `collapseRemark` from `@/views/finance/gift/config`
- Consumes: `formatTime`, `dataTimeFormat` from `@/utils/dayjs`
- Produces: profile UI as per spec §4

- [ ] **Step 1: Add state and computed in script**

在 script 中（遵循现有声明顺序：imports → hooks → state → methods → lifecycle）：

```ts
import { formatTime, dataTimeFormat } from '@/utils/dayjs';
import {
	// existing imports...
	maskPhone,
	shouldCollapseRemark,
	collapseRemark,
} from '@/views/finance/gift/config';

const phoneVisible = ref(false);
const remarkExpanded = ref(false);

const rawPhone = computed(() => profile.value.person?.phone?.trim() || '');
const hasPhone = computed(() => !!rawPhone.value);
const displayPhone = computed(() => {
	if (!rawPhone.value) return '-';
	return phoneVisible.value ? rawPhone.value : maskPhone(rawPhone.value) || rawPhone.value;
});

const remarkText = computed(() => profile.value.person?.remark?.trim() || '');
const remarkCollapsible = computed(() => shouldCollapseRemark(remarkText.value));
const displayRemark = computed(() => {
	if (!remarkText.value) return '-';
	if (!remarkCollapsible.value || remarkExpanded.value) return remarkText.value;
	return collapseRemark(remarkText.value);
});

const formatPayTime = (payTime?: string) => {
	if (!payTime) return '-';
	return formatTime(payTime, dataTimeFormat) || '-';
};
```

进入 profile 加载成功时保持 `phoneVisible = false`；`openEdit` / 离开不必强制，但 `init` 进 profile 时重置：

```ts
// inside loadProfile success / init profile branch:
phoneVisible.value = false;
remarkExpanded.value = false;
```

- [ ] **Step 2: Rewrite profile template sections**

头部副行 + 操作（示例结构，样式 class 可微调但 testid/aria 必须一致）：

```vue
<section class="profile-head">
	<div class="avatar">{{ firstName(profile.person?.personName) }}</div>
	<strong>{{ profile.person?.personName || '-' }}</strong>
	<div class="profile-head-meta">
		<span>
			{{ relationLabel(profile.person?.relationType) }}
			<template v-if="hasPhone"> · {{ displayPhone }}</template>
			<template v-else> · -</template>
		</span>
		<div
			v-if="hasPhone"
			class="profile-phone-actions"
		>
			<button
				type="button"
				class="icon-btn"
				data-testid="gift-person-phone-toggle"
				:aria-label="phoneVisible ? '隐藏手机号' : '显示手机号'"
				@click="togglePhoneVisible"
			>
				<van-icon :name="phoneVisible ? 'eye-o' : 'closed-eye'" />
			</button>
			<button
				type="button"
				class="icon-btn"
				data-testid="gift-person-phone-call"
				aria-label="拨打电话"
				@click="callPhone"
			>
				<van-icon name="phone-o" />
			</button>
			<button
				type="button"
				class="icon-btn"
				data-testid="gift-person-phone-copy"
				aria-label="复制手机号"
				@click="copyPhone"
			>
				<van-icon name="records" />
			</button>
		</div>
	</div>
</section>
```

基本信息仅备注：

```vue
<section class="profile-block">
	<h3>基本信息</h3>
	<van-cell title="备注">
		<template #value>
			<div class="remark-value">
				<span>{{ displayRemark }}</span>
				<button
					v-if="remarkCollapsible"
					type="button"
					class="remark-toggle"
					data-testid="gift-person-remark-toggle"
					@click="remarkExpanded = !remarkExpanded"
				>
					{{ remarkExpanded ? '收起' : '展开' }}
				</button>
			</div>
		</template>
	</van-cell>
</section>
```

历史时间：

```vue
<p>{{ formatPayTime(item.payTime) }} {{ item.remark || '' }}</p>
```

删除原「基本信息」里的手机号、关系 `van-cell`。

- [ ] **Step 3: Implement action methods**

```ts
const togglePhoneVisible = () => {
	navigator.vibrate?.(50);
	phoneVisible.value = !phoneVisible.value;
};

const callPhone = () => {
	if (!rawPhone.value) return;
	navigator.vibrate?.(50);
	window.location.href = `tel:${rawPhone.value}`;
};

const copyPhone = async () => {
	if (!rawPhone.value) return;
	navigator.vibrate?.(50);
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(rawPhone.value);
		} else {
			const input = document.createElement('textarea');
			input.value = rawPhone.value;
			input.setAttribute('readonly', 'true');
			input.style.position = 'fixed';
			input.style.opacity = '0';
			document.body.appendChild(input);
			input.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(input);
			if (!ok) throw new Error('copy failed');
		}
		showSuccessToast('已复制');
	} catch {
		showFailToast('复制失败');
	}
};
```

- [ ] **Step 4: Add scoped styles for meta row / icon buttons / remark**

```less
.profile-head-meta {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	margin-top: 6px;
	width: 100%;

	> span {
		color: #8a94a6;
		font-size: 13px;
	}
}

.profile-phone-actions {
	display: flex;
	gap: 12px;
}

.icon-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	padding: 0;
	border: none;
	border-radius: 50%;
	background: #eaf6ff;
	color: #2098ee;
	cursor: pointer;

	&:active {
		transform: scale(0.96);
	}
}

.remark-value {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4px;
	max-width: 70%;
	text-align: right;
	word-break: break-all;
}

.remark-toggle {
	border: none;
	padding: 0;
	background: transparent;
	color: #1989fa;
	font-size: 12px;
}
```

保留既有 `.gift-person-detail { box-sizing: border-box; ... }`。

- [ ] **Step 5: Manual smoke**

1. 打开有手机号的联系人详情：默认见 `182 **** 2222`，无明文。
2. 点眼睛 → 明文；再点 → 脱敏。
3. 点复制 → toast「已复制」。
4. 往来历史时间无 `T`。
5. 备注 >60 字可展开/收起；短备注无按钮。

- [ ] **Step 6: Lint + unit tests**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
npx eslint --max-warnings=0 "src/views/finance/gift/person/giftPersonDetail/index.vue" "src/views/finance/gift/config.ts"
```

Expected: PASS / 0 warnings.

- [ ] **Step 7: Commit**

```bash
git add src/views/finance/gift/person/giftPersonDetail/index.vue
git commit -m "feat(gift): privacy-friendly person detail profile header"
```

---

### Task 3: Docs + graphify

**Files:**
- Modify: `feature.md`（在礼尚往来/亲友相关小节补 1–2 句：详情默认脱敏手机号、支持显隐/拨号/复制、备注折叠、时间格式化）
- Run graphify

**Interfaces:**
- Consumes: Task 1–2 行为
- Produces: 文档与图谱同步

- [ ] **Step 1: Update feature.md**

在 gift person 段落追加：

```markdown
- 联系人详情（profile）：头部展示关系与脱敏手机号（默认隐藏中间四位，可显隐）；支持拨号与复制；基本信息仅保留备注（超 60 字折叠）；往来历史时间格式为 `YYYY-MM-DD HH:mm`。
```

- [ ] **Step 2: graphify**

```bash
# Prefer Python with graphify module if PATH python lacks it:
# "C:\Users\Administrator\AppData\Local\Programs\Python\Python314\python.exe" -m graphify update src
npm run graphify:update
```

若失败，用 Python 3.14 显式调用后再 `npm run graphify:augment`，提交 `src/graphify-out` 变更。

- [ ] **Step 3: Commit**

```bash
git add feature.md src/graphify-out
git commit -m "docs(gift): note person detail privacy UX and update graphify"
```

---

## Spec Coverage Checklist

| Spec item | Task |
|---|---|
| 布局 B：头含关系+手机，基本信息仅备注 | Task 2 |
| 默认脱敏 + 眼睛显隐 | Task 1 + 2 |
| 拨号 / 复制 + toast + haptic | Task 2 |
| 备注 >60 折叠 | Task 1 + 2 |
| 时间 `YYYY-MM-DD HH:mm` | Task 2 |
| testid / aria-label | Task 2 |
| Vitest helpers | Task 1 |
| 非目标未做 | Global Constraints |
| feature.md + graphify | Task 3 |
