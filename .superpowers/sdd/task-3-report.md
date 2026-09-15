# Task 3 Report: Router guard fetch menus

## Status
DONE

## Commits
none

## Changes
- **File:** `src/router/index.ts`
- Added imports: `getUserMenusApi`, `showFailToast`
- Replaced `router.beforeEach` with async guard per brief:
  - On token + missing routes: fetch menus when `getMenuInfo` empty
  - Success (`code == '200'` && `data?.length`): `setMenuInfo(data)` then `addRouter()`
  - Failure / empty / catch: `showFailToast`, `resetState()`, redirect `{ name: 'login' }`
- `buildRouteAccess`, `addRouter`, helpers unchanged
- `home/index.vue` not modified

## Lint
`npx eslint src/router/index.ts --no-fix` — exit 0; 1 warning (`no-console` on brief-required `console.error` in catch)

## Concerns
- Import order adjusted (vant before local type imports) to satisfy `import/order`; logic matches brief verbatim
- Full-project `npm run lint` fails on unrelated `custom-pets/app-asar-inspect/*.js` tsconfig parse errors (pre-existing)

## Manual test (suggested)
1. Login → guard fetches menus → dynamic routes added
2. Clear menu cache / refresh with token → menus refetched
3. Simulate API failure → toast + redirect login + state cleared
