# Gift Person List P0 Display Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 亲友列表卡：格式化往来时间、显示事由名、展示人情余额。

**Architecture:** 只改 `person/index.vue` 模板与导入；复用 `@/utils/dayjs` 的 `formatTime`/`dataTimeFormat` 与已有 `formatMoney`。不新增 helper/组件。

**Tech Stack:** Vue3 + Vant；dayjs 封装

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-11-gift-person-list-p0-design.md`
- Ponytail：最短 diff；禁止顺手做 P1（等级/筛选/记一笔/摘要四卡）
- auto-import：勿重复 import Vue/Vant；可显式 import `@/utils/dayjs`
- 工作区：`f:/workplace/project/myself/frontend/alex_miaosha_mobile`
- 提交英文 message；勿手加 Co-authored-by

---

## File Map

| File | Responsibility |
| --- | --- |
| `src/views/finance/gift/person/index.vue` | 列表卡三处展示 |
| `feature.md`（可选） | 一行说明 |

---

### Task 1: List card time / event / net amount

**Files:**
- Modify: `src/views/finance/gift/person/index.vue`
- Optional: `feature.md`

**Interfaces:**
- Consumes: `formatTime`, `dataTimeFormat` from `@/utils/dayjs`；`formatMoney` already imported
- Produces: 可读时间 + 可选事由 + `净 ¥…`

- [ ] **Step 1: Add dayjs import**

在 script imports 区增加：

```ts
import { formatTime, dataTimeFormat } from '@/utils/dayjs';
```

- [ ] **Step 2: Replace money + latest lines in template**

将卡片内两段 `<p>` 改为：

```vue
						<p>
							出 {{ formatMoney(item.totalGiveAmount) }} / 入
							{{ formatMoney(item.totalReceiveAmount) }}
							<template v-if="item.netAmount != null">
								/ 净 {{ formatMoney(item.netAmount) }}
							</template>
						</p>
						<p>
							<template v-if="item.latestRecordTime">
								{{ formatTime(item.latestRecordTime, dataTimeFormat) || item.latestRecordTime }}
							</template>
							<template v-else>暂无往来</template>
							<template v-if="item.latestDirection">
								· {{ directionText(item.latestDirection) }}
							</template>
							<template v-if="item.latestEventName">
								· {{ item.latestEventName }}
							</template>
						</p>
```

- [ ] **Step 3: Lint**

```bash
npx eslint --max-warnings=0 "src/views/finance/gift/person/index.vue"
```

Expected: exit 0

- [ ] **Step 4: Manual check**

打开 `/finance/gift/person`：无裸 `T00:00:00`；有事由名则显示；有 `netAmount` 显示「净」。

- [ ] **Step 5: graphify + optional feature.md**

```bash
"C:\Users\Administrator\AppData\Local\Programs\Python\Python314\python.exe" -m graphify update src
```

可选 `feature.md` 补一行：`亲友列表：往来时间格式化，展示事由名与人情余额。`

- [ ] **Step 6: Commit**

```bash
git add src/views/finance/gift/person/index.vue feature.md src/graphify-out/GRAPH_REPORT.md src/graphify-out/graph.html src/graphify-out/graph.json
git commit -m "feat(gift): format person list time and show event net"
```

（无 feature/graphify 变更则勿 add 那些路径。）

---

## Spec Coverage

| Spec item | Task |
| --- | --- |
| formatTime | Task 1 |
| latestEventName | Task 1 |
| netAmount | Task 1 |
| 非目标未做 | Global Constraints |

## Out of scope reminder

relationGrade、筛选、记一笔、摘要四卡、详情页改动 — 一律不做。
