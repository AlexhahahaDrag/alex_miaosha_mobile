import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/modules/user/user';
import {
	buildPermissionSet,
	canAccessPermission,
	isSuperAdmin as judgeSuperAdmin,
} from '@/utils/permission';

export const usePermission = () => {
	const userStore = useUserStore();
	const { getPermissionContext: context, getSuperAdmin } = storeToRefs(userStore);
	const permissionSet = computed(() => buildPermissionSet(context.value));

	const hasPermission = (permissionCode?: string | string[]) => {
		if (getSuperAdmin.value) return true;
		return canAccessPermission(permissionSet.value, permissionCode, judgeSuperAdmin(context.value));
	};

	return {
		permissionContext: context,
		permissionSet,
		hasPermission,
		isSuperAdmin: computed(() => judgeSuperAdmin(context.value)),
	};
};
