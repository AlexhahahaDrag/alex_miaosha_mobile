<template>
	<van-action-sheet
		v-model:show="show"
		:actions="actions"
		@select="onSelect"
		@cancel="cancel"
		description="确认退出登录"
		cancel-text="取消"
		close-on-click-action
		:closeable="true"
	/>
</template>

<script setup lang="ts">
import type { ToastOptions } from 'vant';
import { showToast } from 'vant';
import { useCartStore } from '@/store/modules/shopping/cart';
import { logoutApi } from '@/views/login/api';
import { useUserStore } from '@/store/modules/user/user';

interface Props {
	visible: boolean;
}

const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();
const logout = async () => {
	try {
		await logoutApi();
	} finally {
		cartStore.clearShoppingCart();
		userStore.resetState();
		void router.push('/login');
	}
};
const emit = defineEmits(['select']);
const props = defineProps<Props>();
const show = ref(false);
const actions = [{ name: '退出登录' }];
const onSelect = (item: { name: string | ToastOptions | undefined }) => {
	show.value = false;
	logout();
	showToast(item.name);
};

const cancel = () => {
	show.value = false;
	emit('select', false);
};

watch(
	() => props.visible,
	(newVal) => {
		if (newVal) {
			show.value = newVal;
		}
	},
);
</script>
