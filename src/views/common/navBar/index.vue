<template>
    <van-nav-bar :title="props.info.title" :right-text="props.info.rightButton"
    :left-arrow="!props.info.noShowLeft" @click-left="onClickLeft" @click-right="onClickRight" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

interface Info {
    title?: string;
    leftButton?: string;
    rightButton?: string;
    noShowLeft?: Boolean;
    showRight?: Boolean;
}

interface Props {
    info: Info;
}

const props = defineProps<Props>();
const emit = defineEmits(["clickRight"]);
const router = useRouter();
const onClickLeft = () => {
    // todo修改为返回前一路由
    router.go(-1);
}

const onClickRight = () => {
    emit('clickRight');
}
</script>