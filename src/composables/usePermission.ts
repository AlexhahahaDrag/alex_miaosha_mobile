import { computed } from 'vue';
import { useUserStore } from '@/store/modules/user/user';
import {
	buildPermissionSet,
	canAccessPermission,
	isSuperAdmin as judgeSuperAdmin,
} from '@/utils/permission';

export const usePermission = () => {
	const userStore = useUserStore();
	const context = computed(() => userStore.getPermissionContext);
	const permissionSet = computed(() => buildPermissionSet(context.value));

	const hasPermission = (permissionCode?: string) =>
		canAccessPermission(permissionSet.value, permissionCode, judgeSuperAdmin(context.value));

	return {
		permissionContext: context,
		permissionSet,
		hasPermission,
		isSuperAdmin: computed(() => judgeSuperAdmin(context.value)),
	};
};
