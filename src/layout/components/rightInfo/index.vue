<template>
    <a-badge :count="newsCount">
        欢迎你，{{userInfo ? userInfo.nickName ? userInfo.nickName : userInfo.username : ''}}
        <a-dropdown>
            <a class="ant-dropdown-link" @click.prevent>
                <a-avatar shape="square" :src="userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : ''">
                    <template #icon>
                        <UserOutlined />
                    </template>
                </a-avatar>
            </a>
            <template #overlay>
                <a-menu @click="handleMenuClick">
                    <a-menu-item key="home">
                        首页
                    </a-menu-item>
                    <a-menu-item key="github">
                        github
                    </a-menu-item>
                    <a-menu-item key="resetPwd">
                        重置密码(todo...)
                    </a-menu-item>
                    <a-menu-item key="logout">
                        注销
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>
    </a-badge>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { UserOutlined } from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import router from '@/router/index'
import { logoutApi } from '@/api/user/login'
import { useUserStore } from "@/store/modules/user/user";

const { userInfo } = useUserStore();
const newsCount = ref<number>(0);

const handleMenuClick: MenuProps['onClick'] = e => {
    switch (e.key) {
        case 'home':
            router.push("/");
            break;
        case 'github':
            window.open("https://github.com/AlexhahahaDrag/alex_miaosha_front");
            break;
        case 'logout':
            logout();
            break;
    }
};

function logout() {
    logoutApi().then(() => {
        //跳转到登录页面
        router.push("/login");
    }).catch(e => {
        console.log(e);
    });
}
</script>
<style lang="scss" scoped>
.right-menu-item {
    display: inline-block;
    padding: 0 8px;
    height: 100%;
    font-size: 18px;
    color: #5a5e66;
    vertical-align: text-bottom;

    &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
            background: rgba(0, 0, 0, 0.025);
        }
    }
}

.avatar-container {
    margin-right: 30px;

    .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .ant-avatar {
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 10px;
        }

        .ant-dropdown-link {
            cursor: pointer;
            position: absolute;
            right: -20px;
            top: 25px;
            font-size: 120px;
        }
    }
}
</style>