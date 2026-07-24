# Gift Person Detail Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将联系人详情 profile 重构为 Hero + 胶囊栏 + Bento 金额 + 流水卡 + 渐变编辑/文字删除，并保留既有隐私交互。

**Architecture:** 单文件改造 `giftPersonDetail/index.vue`；可选在 `gift/config.ts` 增加 `formatSignedMoney` / `directionIconName` 纯函数供流水卡使用。表单模式不动。无「全部」、无后端改动。

**Tech Stack:** Vue 3 SFC + Less scoped + Vant icons + Vitest（helpers）

## Global Constraints

- 仅 profile 视觉重构；form 模式不改版。
- 保留隐私：默认脱敏、显隐/电话/复制逻辑与 testid：`gift-person-phone-toggle` / `gift-person-phone-call` / `gift-person-phone-copy` / `gift-person-remark-toggle`。
- 禁止 emoji；图标用 Vant SVG。
- 不放「全部 >」；不做历史分页。
- 删除保留 `showConfirmDialog`；文案改为「确认删除该联系人？」；按钮文案「删除联系人」。
- 保留 `.gift-person-detail { box-sizing: border-box; min-height: 100%; }` 防空滚。
- Token 精确值见 spec（`--gp-bg` `#F8FAFC` 等）。
- 金额展示：现有 `formatMoney` 使用全角 `￥`；signed 助手保持同一货币符号风格。
- auto-import 的 Vue/Vant 勿手动 import。
- 改 `src` 后 graphify（Python 3.14 若 PATH 无模块）。
- 提交英文 message。

---

## File Map

| File | Responsibility |
|---|---|
| `src/views/finance/gift/config.ts` | `formatSignedMoney` / `directionIconName` |
| `src/views/finance/gift/config.spec.ts` | 上述单测 |
| `src/views/finance/gift/person/giftPersonDetail/index.vue` | Profile 模板与样式重构 |
| `feature.md` | 一句视觉改版说明 |

---

### Task 1: Signed money + direction icon helpers (TDD)

**Files:**
- Modify: `src/views/finance/gift/config.ts`
- Test: `src/views/finance/gift/config.spec.ts`

**Interfaces:**
- Consumes: `formatMoney`, `GiftDirection`
- Produces:
  - `formatSignedMoney(direction?: string, amount?: number | string): string` — `RECEIVE` → `+` + `formatMoney(amount)`；其他方向 → `-` + `formatMoney(amount)`（符号接在 `￥` 前：`+￥1.00` / `-￥1.00`）
  - `directionIconName(direction?: string): string` — `RECEIVE` → `gift-o`；`GIVE` → `cash-back-record`；`RETURN` → `replay`；默认 `orders-o`

- [ ] **Step 1: Write failing tests**

```ts
import { formatSignedMoney, directionIconName } from './config';

describe('gift person visual helpers', () => {
	it('formatSignedMoney prefixes + for RECEIVE', () => {
		expect(formatSignedMoney('RECEIVE', 700)).toBe('+￥700.00');
	});

	it('formatSignedMoney prefixes - for GIVE and RETURN', () => {
		expect(formatSignedMoney('GIVE', 100)).toBe('-￥100.00');
		expect(formatSignedMoney('RETURN', 50)).toBe('-￥50.00');
	});

	it('directionIconName maps directions', () => {
		expect(directionIconName('RECEIVE')).toBe('gift-o');
		expect(directionIconName('GIVE')).toBe('cash-back-record');
		expect(directionIconName('RETURN')).toBe('replay');
		expect(directionIconName(undefined)).toBe('orders-o');
	});
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

- [ ] **Step 3: Implement**

```ts
export function formatSignedMoney(direction?: string, amount?: number | string): string {
	const money = formatMoney(amount);
	return direction === 'RECEIVE' ? `+${money}` : `-${money}`;
}

export function directionIconName(direction?: string): string {
	if (direction === 'RECEIVE') return 'gift-o';
	if (direction === 'GIVE') return 'cash-back-record';
	if (direction === 'RETURN') return 'replay';
	return 'orders-o';
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/views/finance/gift/config.ts src/views/finance/gift/config.spec.ts
git commit -m "feat(gift): add signed money and direction icon helpers"
```

---

### Task 2: Profile template + styles redesign

**Files:**
- Modify: `src/views/finance/gift/person/giftPersonDetail/index.vue`

**Interfaces:**
- Consumes: Task 1 helpers；现有 `maskPhone`/remark/phone actions 不变
- Produces: Spec §4 UI

- [ ] **Step 1: Update imports from config**

增加：`formatSignedMoney`, `directionIconName`。

- [ ] **Step 2: Replace profile template block**

用下列结构替换 `v-if="isProfileMode"` 内内容（保留所有 phone/remark 方法与 computed）：

```vue
<template v-if="isProfileMode">
	<section class="profile-hero">
		<div class="profile-hero__wash" />
		<div class="profile-hero__card">
			<div class="avatar">{{ firstName(profile.person?.personName) }}</div>
			<strong class="profile-hero__name">{{ profile.person?.personName || '-' }}</strong>
			<p class="profile-hero__sub">
				{{ relationLabel(profile.person?.relationType) }}
				<template v-if="hasPhone"> · {{ displayPhone }}</template>
				<template v-else> · -</template>
			</p>
			<div
				v-if="remarkText"
				class="profile-hero__remark"
			>
				<span>{{ displayRemark }}</span>
				<button
					v-if="remarkCollapsible"
					type="button"
					class="remark-toggle"
					data-testid="gift-person-remark-toggle"
					:aria-label="remarkExpanded ? '收起备注' : '展开备注'"
					@click="remarkExpanded = !remarkExpanded"
				>
					{{ remarkExpanded ? '收起' : '展开' }}
				</button>
			</div>
			<div
				v-if="hasPhone"
				class="capsule-bar"
			>
				<button
					type="button"
					class="capsule-btn"
					data-testid="gift-person-phone-toggle"
					:aria-label="phoneVisible ? '隐藏手机号' : '显示手机号'"
					@click="togglePhoneVisible"
				>
					<van-icon :name="phoneVisible ? 'eye-o' : 'closed-eye'" />
					<span>显隐</span>
				</button>
				<button
					type="button"
					class="capsule-btn"
					data-testid="gift-person-phone-call"
					aria-label="拨打电话"
					@click="callPhone"
				>
					<van-icon name="phone-o" />
					<span>电话</span>
				</button>
				<button
					type="button"
					class="capsule-btn"
					data-testid="gift-person-phone-copy"
					aria-label="复制手机号"
					@click="copyPhone"
				>
					<van-icon name="records" />
					<span>复制</span>
				</button>
			</div>
		</div>
	</section>

	<section class="profile-metrics">
		<div class="metric-card metric-card--give">
			<span>累计送礼</span>
			<strong>
				<small>￥</small>{{ metricNumber(profile.person?.totalGiveAmount) }}
			</strong>
		</div>
		<div class="metric-card metric-card--recv">
			<span>累计收礼</span>
			<strong>
				<small>￥</small>{{ metricNumber(profile.person?.totalReceiveAmount) }}
			</strong>
		</div>
	</section>

	<section class="history-block">
		<h3>往来历史</h3>
		<div
			v-if="!(profile.records || []).length"
			class="profile-empty"
		>
			暂无往来记录
		</div>
		<div
			v-for="item in profile.records || []"
			:key="item.id"
			class="history-card"
		>
			<div
				class="history-card__icon"
				:class="directionClass(item.direction)"
			>
				<van-icon :name="directionIconName(item.direction)" />
			</div>
			<div class="history-card__body">
				<strong>{{ directionText(item.direction) }}</strong>
				<p>{{ formatPayTime(item.payTime) }} {{ item.remark || '' }}</p>
			</div>
			<strong
				class="history-card__amount"
				:class="directionClass(item.direction)"
			>
				{{ formatSignedMoney(item.direction, item.amount) }}
			</strong>
		</div>
	</section>

	<div class="detail-actions">
		<van-button
			v-if="hasPermission('gift:edit')"
			block
			round
			class="btn-edit"
			data-testid="gift-person-edit"
			@click="openEdit"
		>
			编辑资料
		</van-button>
		<button
			v-if="hasPermission('gift:delete')"
			type="button"
			class="btn-delete-text"
			data-testid="gift-person-delete"
			:disabled="deleting"
			@click="removePerson"
		>
			{{ deleting ? '删除中…' : '删除联系人' }}
		</button>
	</div>
</template>
```

- [ ] **Step 3: Add metricNumber helper in script**

```ts
import { directionClass, directionIconName, formatSignedMoney, /* existing */ } from '@/views/finance/gift/config';

const metricNumber = (value?: number | string) => Number(value || 0).toFixed(2);
```

- [ ] **Step 4: Update delete confirm copy**

```ts
await showConfirmDialog({ title: '确认删除该联系人？' });
```

- [ ] **Step 5: Replace profile-related styles**

保留 form 相关样式不动。将 profile 样式改为（核心片段，可整段替换旧 `.profile-*` / `.detail-actions` profile 用途）：

```less
.gift-person-detail {
	--gp-bg: #f8fafc;
	--gp-card: #ffffff;
	--gp-radius: 20px;
	--gp-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
	--gp-give-bg: #fff5f5;
	--gp-give-fg: #e53e3e;
	--gp-recv-bg: #f0fdf4;
	--gp-recv-fg: #15803d;
	--gp-primary-from: #2563eb;
	--gp-primary-to: #3b82f6;

	box-sizing: border-box;
	min-height: 100%;
	padding: 12px 16px 28px;
	background: var(--gp-bg);
}

.profile-hero {
	position: relative;
	margin-bottom: 14px;
}

.profile-hero__wash {
	position: absolute;
	inset: 0 0 40% 0;
	border-radius: var(--gp-radius);
	background: linear-gradient(180deg, #dbeafe 0%, rgba(248, 250, 252, 0) 100%);
	pointer-events: none;
}

.profile-hero__card {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 28px 16px 18px;
	background: var(--gp-card);
	border-radius: var(--gp-radius);
	box-shadow: var(--gp-shadow);
}

.avatar {
	width: 64px;
	height: 64px;
	margin-bottom: 12px;
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #2563eb;
	background: #eff6ff;
	font-weight: 800;
	font-size: 24px;
}

.profile-hero__name {
	color: #0f172a;
	font-size: 20px;
}

.profile-hero__sub {
	margin: 6px 0 0;
	color: #64748b;
	font-size: 13px;
}

.profile-hero__remark {
	margin-top: 10px;
	max-width: 100%;
	text-align: center;
	color: #94a3b8;
	font-size: 12px;
	line-height: 1.5;
	word-break: break-all;
}

.capsule-bar {
	display: flex;
	justify-content: center;
	gap: 18px;
	margin-top: 18px;
	width: 100%;
}

.capsule-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	min-width: 56px;
	padding: 0;
	border: none;
	background: transparent;
	color: #2563eb;
	font-size: 11px;
	cursor: pointer;

	.van-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 999px;
		background: #eff6ff;
		font-size: 20px;
	}

	&:active {
		transform: scale(0.96);
	}
}

.profile-metrics {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
	margin-bottom: 14px;
}

.metric-card {
	padding: 14px 16px;
	border-radius: var(--gp-radius);
	box-shadow: var(--gp-shadow);

	span {
		display: block;
		color: #64748b;
		font-size: 12px;
	}

	strong {
		display: block;
		margin-top: 8px;
		font-size: 22px;
		font-weight: 800;
		letter-spacing: -0.02em;

		small {
			margin-right: 2px;
			font-size: 13px;
			font-weight: 600;
		}
	}

	&--give {
		background: var(--gp-give-bg);
		strong { color: var(--gp-give-fg); }
	}

	&--recv {
		background: var(--gp-recv-bg);
		strong { color: var(--gp-recv-fg); }
	}
}

.history-block {
	padding: 14px 16px 8px;
	margin-bottom: 14px;
	background: var(--gp-card);
	border-radius: var(--gp-radius);
	box-shadow: var(--gp-shadow);

	h3 {
		margin: 0 0 10px;
		font-size: 15px;
		color: #0f172a;
	}
}

.history-card {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 0;
	border-top: 1px solid #f1f5f9;

	&:first-of-type {
		border-top: none;
	}
}

.history-card__icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 12px;
	background: #f1f5f9;
	color: #64748b;
	flex-shrink: 0;

	&.is-income {
		background: var(--gp-recv-bg);
		color: var(--gp-recv-fg);
	}

	&.is-give,
	&.is-return {
		background: var(--gp-give-bg);
		color: var(--gp-give-fg);
	}
}

.history-card__body {
	flex: 1;
	min-width: 0;

	strong {
		display: block;
		color: #0f172a;
		font-size: 14px;
	}

	p {
		margin: 4px 0 0;
		color: #94a3b8;
		font-size: 12px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.history-card__amount {
	flex-shrink: 0;
	font-size: 15px;
	font-weight: 700;

	&.is-income { color: var(--gp-recv-fg); }
	&.is-give,
	&.is-return { color: var(--gp-give-fg); }
}

.profile-empty {
	padding: 16px 0 20px;
	color: #94a3b8;
	font-size: 13px;
	text-align: center;
}

.detail-actions {
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 8px 0 12px;
	padding-bottom: env(safe-area-inset-bottom, 0);
}

.btn-edit {
	border: none;
	background: linear-gradient(90deg, var(--gp-primary-from), var(--gp-primary-to));
	box-shadow: 0 8px 18px rgba(37, 99, 235, 0.28);
}

.btn-delete-text {
	border: none;
	padding: 10px;
	background: transparent;
	color: #9ca3af;
	font-size: 14px;
	cursor: pointer;

	&:active {
		color: #ef4444;
	}

	&:disabled {
		opacity: 0.6;
	}
}

.remark-toggle {
	border: none;
	margin-left: 6px;
	padding: 0;
	background: transparent;
	color: #2563eb;
	font-size: 12px;
}
```

删除已无用的旧 class：`.profile-head`、`.profile-block`（若 form 未用）、旧 `.icon-btn` 等，避免死样式堆积。

- [ ] **Step 6: Lint + unit**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
npx eslint --max-warnings=0 "src/views/finance/gift/person/giftPersonDetail/index.vue" "src/views/finance/gift/config.ts"
```

- [ ] **Step 7: Manual smoke**

1. Profile：Hero/胶囊/Bento/流水卡/渐变编辑/文字删除可见。  
2. 隐私：默认脱敏、显隐、复制 toast、时间无 `T`。  
3. 删除仍弹确认。  
4. 无「全部」。  
5. 表单新增/编辑仍可用。

- [ ] **Step 8: Commit**

```bash
git add src/views/finance/gift/person/giftPersonDetail/index.vue
git commit -m "feat(gift): redesign person detail profile visuals"
```

---

### Task 3: Docs + graphify

**Files:**
- Modify: `feature.md`
- Run graphify

- [ ] **Step 1: feature.md**

在亲友/联系人详情相关条目追加：

```markdown
- 联系人详情 profile 视觉：Hero 头图区、胶囊操作栏、Bento 收送礼金额、流水式往来历史；编辑为渐变主按钮，删除为弱文字按钮（二次确认保留）。
```

- [ ] **Step 2: graphify**

```bash
# Prefer:
# "C:\Users\Administrator\AppData\Local\Programs\Python\Python314\python.exe" -m graphify update src
# npm run graphify:augment
npm run graphify:update
```

- [ ] **Step 3: Commit**

```bash
git add feature.md src/graphify-out
git commit -m "docs(gift): note person detail visual redesign and update graphify"
```

---

## Spec Coverage Checklist

| Spec item | Task |
|---|---|
| Hero + 备注并入 | Task 2 |
| 胶囊三键 + testid | Task 2 |
| Bento 金额色 | Task 2 |
| 流水卡 + signed money | Task 1 + 2 |
| 无「全部」 | Task 2 |
| 渐变编辑 / 文字删除 + 确认文案 | Task 2 |
| Token / 防空滚 | Task 2 |
| 隐私保留 | Task 2 smoke |
| feature.md + graphify | Task 3 |
| 表单不改版 | Global Constraints |
