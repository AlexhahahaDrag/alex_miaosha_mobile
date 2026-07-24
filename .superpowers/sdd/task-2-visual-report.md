# Task 2 Visual Report — Profile template + styles redesign

## Status

**DONE_WITH_CONCERNS**

## Changes

- `index.vue` profile：`profile-hero`（wash + 备注入 Hero + capsule 电话操作）、`profile-metrics` bento、`history-block` 流水卡片（`directionClass` / `directionIconName` / `formatSignedMoney`）
- 移除「基本信息」块；删除改为文字按钮；确认文案「确认删除该联系人？」
- 新增 `metricNumber`；CSS 变量 + 新 profile 样式；表单模式未改

## Commits

- `62eb2cc` — `feat(gift): redesign person detail profile visuals`（仅 `giftPersonDetail/index.vue`）

## Tests

| Command | Result |
|---------|--------|
| `npm run test:unit -- src/views/finance/gift/config.spec.ts` | 12/12 pass |
| `npx eslint --max-warnings=0 index.vue config.ts` | pass |

## Smoke (manual)

- `localhost:2000` HTTP 200；浏览器 MCP 无可用 tab，未跑 Midscene/手测
- 建议本地打开联系人详情：Hero/胶囊/指标/历史/渐变编辑/文字删除；隐私显隐复制；无「全部」

## Concerns

1. `npm run graphify:update` 失败：`No module named graphify`
2. 自动化 smoke 未执行（需登录 + 有效联系人 id）

## Report path

`.superpowers/sdd/task-2-visual-report.md`

## Browser smoke

- **When:** 2026-07-24 · `http://localhost:2000/`（已登录 superman 会话）
- **Route:** `#/finance/gift/person/giftPersonDetail?id=2080540386315321345`（test-phone）；历史项 `#/finance/gift/person/giftPersonDetail?id=2075483602678251522`（马俊峰）

| # | Check | Result |
|---|--------|--------|
| 1 | Hero/card (`profile-hero`) | **PASS** |
| 2 | Capsule 显隐/电话/复制 + testids | **PASS** |
| 3 | Default phone masked | **PASS** (`182 **** 2222`) |
| 4 | Toggle reveals phone | **PASS** (`18222222222`) |
| 5 | Copy → toast 已复制 | **PASS** |
| 6 | Bento two colored metric cards | **PASS** (`--give` / `--recv`) |
| 7 | History signed amounts (+/-) | **PASS** (`+￥700.00`，1 条) |
| 8 | Edit present; delete text「删除联系人」 | **PASS**（`btn-delete-text`，非红色 outline） |
| 9 | No「全部」link | **PASS** |
| 10 | No standalone「基本信息」title | **PASS** |

**Overall:** 10/10 PASS
