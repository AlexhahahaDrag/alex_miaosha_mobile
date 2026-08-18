# Gift API Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or implement inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 mobile gift 聚合 API 拆到 person/event/record 各自 `api/index.ts`，并删除 `normalizeGiftIds`。

**Architecture:** 页面旁 API；无 barrel；入参不做前端 ID normalize。

**Tech Stack:** Vue 3 + TypeScript + 现有 `@/views/common/api`

## Global Constraints

- 禁止 `@/views/finance/gift/api` 聚合入口
- 删除 `normalizeGiftIds` 及单测
- 函数名保持不变；`GiftId` + 后端 Long2String
- 改完 lint / test:unit / graphify

---

### Task 1: 新建三域 API 文件

**Files:**
- Create: `src/views/finance/gift/person/api/index.ts`
- Create: `src/views/finance/gift/event/api/index.ts`
- Create: `src/views/finance/gift/record/api/index.ts`

- [ ] 从原 `gift/api/index.ts` 按域剪切函数，去掉所有 `normalizeGiftIds(...)` 包装
- [ ] 各文件内自持 path 常量与 `pageUrl`/`listUrl`/`baseUrl` 小函数（或内联）

### Task 2: 迁移 import + 删除旧目录

**Files:**
- Modify: person/event/record/dashboard/analysis 页面 + `useGiftRelationOptions.ts`
- Delete: `gift/api/*`

- [ ] 切换全部 import
- [ ] `rg` 确认无残留

### Task 3: 文档 + 验证

- [ ] 更新 `DEVELOPMENT.md`
- [ ] `npm run test:unit`、`npm run lint`（改动相关）、`graphify update src`
- [ ] Commit
