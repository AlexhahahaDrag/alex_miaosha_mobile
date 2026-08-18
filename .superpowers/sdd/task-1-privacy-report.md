# Task 1 Report: Phone/remark helpers (TDD)

## Status

**Complete** — `maskPhone`, `shouldCollapseRemark`, `collapseRemark` exported from `src/views/finance/gift/config.ts`; Vitest coverage in `config.spec.ts`.

## Commit

- `fc6c1ba` — `feat(gift): add maskPhone and remark collapse helpers`
- Files: `config.ts`, `config.spec.ts`

## TDD Evidence

### RED (Step 2)

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

```
Test Files  1 failed (1)
Tests  5 failed | 4 passed (9)
```

Failures: `TypeError: (0 , maskPhone) is not a function` (and same for `shouldCollapseRemark`, `collapseRemark`). Existing relation helper tests (4) passed.

### GREEN (Step 4)

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

```
Test Files  1 passed (1)
Tests  9 passed (9)
Duration  ~3s
```

## Test Summary

| Suite | Cases |
|-------|-------|
| gift person relation helpers | 4 (unchanged) |
| gift person privacy helpers | 5 (new) |

Privacy cases: 11-digit CN mobile mask, empty/undefined phone, non-11-digit passthrough, remark collapse threshold (trim-aware, limit 60), truncate with `…`.

## Concerns

- `npm run graphify:update` failed locally (`No module named graphify`); graph not refreshed in this session.
- Ellipsis in tests/impl uses Unicode `…` (U+2026), consistent with existing `自定义…` in `config.ts`.

## Brief Alignment

Signatures and test bodies match `task-1-privacy-brief.md` Step 1–4; implementation matches Step 3.
