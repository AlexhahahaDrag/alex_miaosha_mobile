<template>
	<van-tabs v-model:active="activeTab" sticky swipeable @change="changeTab">
		<van-tab title="test1" name="1">
			<test1 v-bind="props"></test1>
		</van-tab>
		<van-tab title="test2" name="2">
			<test2 v-bind="props"></test2>
		</van-tab>
		<van-tab title="test3" name="3">
			<test3 v-bind="props"></test3>
		</van-tab>
		<van-tab title="test4" name="4">
			<test4 v-bind="props"></test4>
		</van-tab>
	</van-tabs>
</template>

<script setup lang="ts">
import test1 from './test1/index.vue';
import test2 from './test2/index.vue';
import test3 from './test3/index.vue';
import test4 from './test4/index.vue';

let activeTab = ref<number>(1);

let props = reactive<any>({
	activeTab: activeTab.value,
});

const changeTab = (name: number) => {
	props.activeTab = name;
	activeTab.value = name;
};
</script>
