# Task 1 Report: Signed money + direction icon helpers

## Status

**Complete** — TDD RED → GREEN, committed.

## Changes

| File | Change |
|------|--------|
| `src/views/finance/gift/config.ts` | Added `formatSignedMoney`, `directionIconName` after `formatMoney` |
| `src/views/finance/gift/config.spec.ts` | Added `describe('gift person visual helpers')` with 3 cases |

## TDD Evidence

### RED (Step 2)

```text
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

- **Result:** FAIL — 3 failed | 9 passed (12)
- **Cause:** `TypeError: (0 , formatSignedMoney) is not a function` / same for `directionIconName`

### GREEN (Step 4)

```text
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

- **Result:** PASS — 12 passed (12)
- **Duration:** ~5.4s (vitest v3.2.4)

## Commit

```text
feat(gift): add signed money and direction icon helpers
```

Hash: `0881b33`

Files staged: `config.ts`, `config.spec.ts` only.

## Behavior

- `formatSignedMoney`: `RECEIVE` → `+` + `formatMoney(amount)`; all other directions (incl. undefined) → `-` + `formatMoney(amount)`.
- `directionIconName`: `RECEIVE` → `gift-o`, `GIVE` → `cash-back-record`, `RETURN` → `replay`, default → `orders-o`.

## Concerns

- `npm run graphify:update` failed locally (`No module named graphify` on Python 3.9); graph not refreshed this session.
- Non-`RECEIVE` directions share `-` prefix (including unknown/undefined direction per brief implementation).
