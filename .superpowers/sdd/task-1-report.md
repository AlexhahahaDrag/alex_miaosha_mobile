# Task 1 Report: API `getUserMenusApi`

**Status:** DONE  
**Plan:** `docs/superpowers/plans/2026-09-15-mobile-menu-on-enter.md` (backend repo)  
**Brief note:** `.superpowers/sdd/task-1-brief.md` contained stale gift-person-detail content; implemented from plan Task 1 verbatim.

## Changes

**File:** `src/views/login/api/index.ts`

- Added imports: `getData` from `@/views/common/api`, `MenuInfoData` from `@/views/user/menuInfo/config`
- Added `menus = '/user/menus'` to `Api` enum
- Added `getUserMenusApi(): Promise<ResponseBody<MenuInfoData[]>>` calling `getData(baseService.user + Api.menus)`
- Preserved existing `loginApi`, `logoutApi`, `LoginParams`, `transParams` unchanged

## Verification

### Step 2: Typecheck

```bat
cd /d F:\workplace\project\myself\frontend\alex_miaosha_mobile
npx vue-tsc --noEmit --pretty false 2>&1 | findstr /i "login/api"
```

**Result:** No `login/api` related errors (findstr returned no matches).  
**Note:** Full-project `vue-tsc` exits non-zero due to pre-existing unrelated errors elsewhere in the repo.

### ESLint

`read_lints` on `src/views/login/api/index.ts`: clean.

### graphify:update

Attempted `npm run graphify:update` — **blocked** (`python -m graphify`: No module named graphify on this machine). No graph change.

## Self-review

| Check | Result |
|-------|--------|
| Matches plan code verbatim | Yes |
| No store/router changes | Yes |
| No git commit | Yes |
| Return type `ResponseBody<MenuInfoData[]>` | Yes |
| URL path aligns with PC (`/api/am-user` + `/user/menus` → formatUrl adds prefix) | Yes |
| ID types remain string via `MenuInfoData` | Yes |

## Out of scope (later tasks)

- Task 2: `user.ts` login store `setMenuInfo([])`
- Task 3: router guard fetch menus before `addRouter`
- Task 4: DEVELOPMENT.md + checklist updates

## Commits

None (per global constraint).
