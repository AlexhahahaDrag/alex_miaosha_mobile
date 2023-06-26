<template> 
    <van-action-sheet v-model:show="show" :actions="actions" @select="onSelect" @cancel="cancel" description="确认退出登录" cancel-text="取消"
        close-on-click-action :closeable="true" />
</template>

<script setup lang="ts">
import { ref, watch, } from 'vue';
import { ToastOptions, showToast } from 'vant';
import { logoutApi } from '@/api/user/login'
import router from '@/router/index'

interface Props {
    visible: boolean,
}

const emit = defineEmits(["select"]);
const props = defineProps<Props>();
const show = ref(false);
const actions = [
    { name: '退出登录', },
];
const onSelect = (item: { name: string | ToastOptions | undefined; }) => {
    show.value = false;
    logout();
    showToast(item.name);
};

const cancel = () => {
    show.value = false;
    emit("select", false); 
}

const logout = () => {
    logoutApi().then(() => {
        //跳转到登录页面
        router.push("/login");
        emit("select", false);
    }).catch(e => {
        console.log(e);
    });
}

watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            show.value = newVal;
        }
    },
);
</script>