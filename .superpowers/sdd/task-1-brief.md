### Task 1: API `getUserMenusApi`

**Files:**
- Modify: `F:/workplace/project/myself/frontend/alex_miaosha_mobile/src/views/login/api/index.ts`
- Consumes: `getData` / `baseService` from `@/views/common/api`；`MenuInfoData` from `@/views/user/menuInfo/config`；`ResponseBody` from `@/types/api`
- Produces: `getUserMenusApi(): Promise<ResponseBody<MenuInfoData[]>>`

- [ ] **Step 1: 扩展 login api** — add menus enum + getUserMenusApi via getData(baseService.user + Api.menus)
- [ ] **Step 2: 类型检查** — vue-tsc filter login/api

Do NOT commit. Do NOT touch store/router.
