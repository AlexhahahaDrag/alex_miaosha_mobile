# Task 2 Report: Login store clear menus

## Status

**DONE**

## Scope

Per `task-2-brief.md`, stop persisting menus from the login response body. Menus will be loaded later via `GET /user/menus` (Task 3).

## Change

**File:** `src/store/modules/user/user.ts`

**Before:**
```typescript
this.setMenuInfo(permissionContext.menuInfo || null);
```

**After:**
```typescript
// Menus loaded on enter via GET /user/menus (login slim)
this.setMenuInfo([]);
```

## Unchanged (verified)

- `setUserInfo`, `setToken`, `setRoleInfo`, `setOrgInfo`, `roleList`, `setPermissionCodes`, `setSuperAdmin`
- `changeRouteStatus(false)` — routes remain gated until menus are fetched
- `refreshRouter()` — still invoked after login
- `buildPermissionContext(admin)` — still used for org, roles, permission codes
- No edits to router or login API

## Self-review

| Check | Result |
|-------|--------|
| Single-line behavioral change only | Pass |
| Comment matches brief | Pass |
| `setMenuInfo([])` yields empty array (not null) | Pass — `[]` is truthy in `setMenuInfo` |
| Lint on modified file | Pass — no diagnostics |
| Router / login API untouched | Pass |
| Git commit | None (per instructions) |

## Expected runtime behavior

- **Login success:** `menuInfo` is `[]`, `hasMenu` is `false`.
- **Navigation:** Dynamic routes stay empty until Task 3 fetches menus and sets `hasMenu` / `menuInfo`.
- **Permissions:** Org, roles, and `permissionCodes` still come from login via `buildPermissionContext`.

## Test summary

Static review only: diff matches brief; lint clean. No manual login run in this task.

## Concerns

- **Task 3 dependency:** Until router/menu fetch is implemented, post-login navigation may lack dynamic routes. This is intentional for the slim-login split.
- **Persisted state:** Pinia persist may still hold old `menuInfo` from prior sessions until next login clears it to `[]`.

## Commits

None.
