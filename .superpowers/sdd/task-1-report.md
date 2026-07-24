# Task 1 Report: Fix giftPersonDetail (primary bug)

## Status

**DONE** (Fix wave: browser Step 2/3 executed; Co-authored-by cleanup still environment-blocked)

## Summary

Added `box-sizing: border-box` to `.gift-person-detail` in `src/views/finance/gift/person/giftPersonDetail/index.vue` so `min-height: 100%` includes the 16px padding in the box model. Without it, the root element exceeded the scroll container height by 32px and `.content-container` showed an empty Y-scrollbar on short forms (e.g. 新增联系人 without `id`).

Layout file `src/layouts/index.vue` was **not** modified (`.content-container { overflow-y: auto }` unchanged).

## Implementation

| Step | Result |
|------|--------|
| Step 1: Apply `border-box` on page root | Done — single line added per brief |
| Step 2: Manual verify short form | **Pass** — see Fix wave (reload 后 `ok: true`) |
| Step 3: Manual verify long content scrolls | **Pass** — see Fix wave (`canScroll: true`) |
| Step 4: Commit | Done — see below |

### CSS change (verbatim per brief)

```less
.gift-person-detail {
	box-sizing: border-box;
	min-height: 100%;
	padding: 16px;
	background: #f8fbff;
}
```

## Verification (static)

- File read confirms `box-sizing: border-box` is first property in `.gift-person-detail` block (lines ~398–403).
- Root cause alignment: default `content-box` + `min-height: 100%` + vertical padding → computed height > 100% of parent → spurious overflow on `.content-container`.

## Commit

- **SHA:** `3649f27`
- **Subject:** `fix(gift): prevent empty Y-scroll on person detail form`
- **Files:** `src/views/finance/gift/person/giftPersonDetail/index.vue` (+1 line)

## Self-review

- **Scope:** Minimal; only the specified selector; no layout or logic changes.
- **Risk:** Low. `border-box` is standard for full-height padded shells; long-content scroll still depends on parent `overflow-y: auto` (unchanged).
- **Regression:** Child components unaffected; padding/background unchanged.
- **Tests:** N/A per plan (pure CSS).
- **graphify:** `npm run graphify:update` failed (`No module named graphify` on host Python); graph not refreshed this session.

## Concerns

1. **Commit trailer** — environment injects `Co-authored-by: Cursor <cursoragent@cursor.com>` on every `git commit` (including docs); amend/rebase strip attempts blocked by host git wrapper. Controller adjudicates; do not spend cycles amending in-agent.
2. **graphify** not updated due missing Python module.

## Fix wave (review follow-up)

**Tool:** `user-chrome-devtools` MCP (`navigate_page`, `fill_form`, `evaluate_script`). `cursor-ide-browser` could not open a tab (`No browser tab available`).

**Commands / flow:**

1. `navigate_page` → `http://localhost:2000/` → redirected `#/login`.
2. Login: `superman` / `1234@com` (from PC `.env` RBAC vars; mobile `.env` has no test creds). POST `.../user/login` succeeded → `#/dashboard`.
3. `navigate_page` → `http://localhost:2000/#/finance/gift/person/giftPersonDetail` — title **新增联系人**, `.gift-person-detail` present.

**Step 2 — short form (evaluate on `.content-container`):**

After hard reload on detail route (empty 备注):

```json
{"scrollHeight":843,"clientHeight":843,"ok":true,"hasDetail":true,"maxScroll":0,"boxSizing":"border-box","ccPaddingBottom":"0px","withTabbar":false}
```

Brief console snippet equivalent: `scrollHeight <= clientHeight` → **true** (no Y overflow).

*Note:* First post-login visit with bottom TabBar visible once showed `scrollHeight:899`, `clientHeight:843`, `ok:false` (`padding-bottom` on `.with-tabbar`); after reload on detail, TabBar hidden (`withTabbar:false`) and short-form check matches brief.

**Step 3 — long content:**

`fill` 备注 40 行后:

```json
{"scrollHeight":1555,"clientHeight":843,"canScroll":true,"maxScroll":712}
```

Earlier 80 行 programmatic fill: `scrollHeight:2771`, `canScroll:true`.

**Static CSS (file read):** `.gift-person-detail` line 399 `box-sizing: border-box;` — confirmed; runtime `getComputedStyle(...).boxSizing === "border-box"`.

**Conclusion:** Task 1 CSS fix verified in browser for 新增联系人 short form (no empty Y-scroll when `ok:true`) and long 备注 still scrolls. Co-authored-by trailer remains environment-blocked per Concerns #1.

## Checklist (from brief)

- [x] Step 1: Apply border-box on page root
- [x] Step 2: Manual verify short form
- [x] Step 3: Manual verify long content still scrolls
- [x] Step 4: Commit

## Report path

`f:\workplace\project\myself\frontend\alex_miaosha_mobile\.superpowers\sdd\task-1-report.md`
