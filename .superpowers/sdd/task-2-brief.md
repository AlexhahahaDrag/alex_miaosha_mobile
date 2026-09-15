### Task 2: Login store 清空菜单

**Files:**
- Modify: `F:/workplace/project/myself/frontend/alex_miaosha_mobile/src/store/modules/user/user.ts`
- Consumes: 现有 `setMenuInfo`、`buildPermissionContext`（仍用于 org/roles/codes）
- Produces: 登录成功后 `menuInfo` 为空（`setMenuInfo([])`）

将 login action 中：
```typescript
this.setMenuInfo(permissionContext.menuInfo || null);
```
改为：
```typescript
// Menus loaded on enter via GET /user/menus (login slim)
this.setMenuInfo([]);
```

其余 setUserInfo / setToken / role / org / permissionCodes / changeRouteStatus(false) / refreshRouter() **保持不变**。

Do NOT commit. Do NOT touch router or login api in this task.
