<template>
	<van-nav-bar
		:title="props.info.title"
		:right-text="props.info.rightButton"
		:left-arrow="!props.info.noShowLeft"
		@click-left="onClickLeft"
		@click-right="onClickRight"
	>
		<template
			#right
			v-if="props.info.rightIcon"
		>
			<div class="nav-right-icon-wrapper">
				<van-icon
					:name="props.info.rightIcon"
					size="18"
				/>
			</div>
		</template>
	</van-nav-bar>
</template>

<script setup lang="ts">
interface Info {
	title?: string;
	leftButton?: string;
	rightButton?: string;
	rightIcon?: string;
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

const router = useRouter();

const onClickLeft = () => {
	if (props.info?.leftPath) {
		const leftArr = props.info.leftPath.split('?');
		const query: Record<string, string> = {};
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

const emit = defineEmits(['clickRight']);
</script>

<style scoped>
.nav-right-icon-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	background-color: rgba(25, 137, 250, 0.1);
	border-radius: 50%;
	color: #1989fa;
	box-shadow: 0 2px 8px rgba(25, 137, 250, 0.2);
}
</style>
