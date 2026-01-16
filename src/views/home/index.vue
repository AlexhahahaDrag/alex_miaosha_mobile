<template>
	<div>
		<van-grid
			:column-num="3"
			:square="true"
		>
			<van-grid-item
				v-for="item in homeList"
				:key="item.id"
				:text="item?.meta?.title"
				:to="item.path"
			>
				<SvgIcon
					class="homeSvgClass"
					:name="item?.meta?.icon"
				></SvgIcon>
				<span class="homeFontClass">{{ item?.meta?.title || 'null' }}</span>
			</van-grid-item>
		</van-grid>
	</div>
</template>

<script setup lang="ts">
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';

const route = useRoute();
const router = useRouter();
const homeList = ref<any>([]);

// 使用新的NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '财务明细',
	noShowLeft: true,
	showRight: false,
	visible: true,
});

useTabBar({
	visible: true,
	data: ['dashboard', 'message', 'myself'],
	active: 1,
});

const getHomeList = (arr: readonly any[] | null) => {
	if (arr?.length) {
		arr.forEach((item: any) => {
			if (item) {
				if (item?.meta?.showInHome) {
					homeList.value.push(item);
				}
				if (item.children?.length) {
					getHomeList(item.children);
				}
			}
		});
	}
};

const init = () => {
	homeList.value = [];
	getHomeList(router?.options?.routes || []);
};

init();
</script>

<style lang="less" scoped>
.homeSvgClass {
	height: 80%;
	width: 80%;
	font-size: 18px;
	cursor: pointer;
	vertical-align: middle;
}

.homeFontClass {
	margin-top: 8px;
	margin-bottom: 8px;
	color: darkgray;
	font-weight: bold;
	font-size: 14px;
}
</style>
