<template>
	<van-nav-bar
		:title="props.info.title"
		:right-text="props.info.rightButton"
		:left-arrow="!props.info.noShowLeft"
		@click-left="onClickLeft"
		@click-right="onClickRight"
	/>
</template>

<script setup lang="ts">
interface Info {
	title?: string;
	leftButton?: string;
	rightButton?: string;
	noShowLeft?: boolean;
	showRight?: boolean;
	leftPath?: string;
}

interface Props {
	info: Info;
}

const props = withDefaults(defineProps<Props>(), {
	info: () => ({ noShowLeft: false, showRight: false }),
});

const emit = defineEmits(['clickRight']);
const router = useRouter();
const onClickLeft = () => {
	if (props.info?.leftPath) {
		const leftArr = props.info.leftPath.split('?');
		const query: Record<string, any> = {};
		if (leftArr?.length > 1) {
			const params = new URLSearchParams(leftArr[1]);
			params.forEach((value, key) => {
				query[key] = value;
			});
		}
		router.push({
			path: leftArr[0],
			query,
		});
	} else {
		router.go(-1);
	}
};

const onClickRight = () => {
	emit('clickRight');
};
</script>
