### Task 3: Router 守卫拉菜单 + 失败回登录

**Files:**
- Modify: `F:/workplace/project/myself/frontend/alex_miaosha_mobile/src/router/index.ts`

**Add imports:**
```typescript
import { getUserMenusApi } from '@/views/login/api';
import { showFailToast } from 'vant';
```

**Replace `router.beforeEach` with:**

```typescript
router.beforeEach(async (to) => {
	const userStore = useUserStore();
	if (to.path == '/login') {
		isAdded = false;
		return true;
	}

	if (userStore.getToken) {
		if (!userStore.getRouteStatus || !isAdded) {
			dynamicRouter = [];
			if (!userStore.getMenuInfo?.length) {
				try {
					const {
						code,
						data,
						message: messageInfo,
					} = await getUserMenusApi();
					if (code == '200' && data?.length) {
						userStore.setMenuInfo(data);
					} else {
						showFailToast(messageInfo || '加载菜单失败');
						userStore.resetState();
						return { name: 'login' };
					}
				} catch (error: unknown) {
					console.error('加载用户菜单失败：', error);
					showFailToast('加载菜单失败，请重新登录');
					userStore.resetState();
					return { name: 'login' };
				}
			}
			addRouter();
			isAdded = true;
			if (routes.length > 5) {
				return { ...to, replace: true };
			}
		}
		return true;
	}
	return { name: 'login' };
});
```

Keep `buildRouteAccess` / `addRouter` / helpers unchanged.
Must setMenuInfo BEFORE addRouter.
Do NOT commit. Do NOT change home/index.vue.
Run lint on touched files if possible.
