<template>
  <div>
    <div class="user">
      <van-image width="10rem" height="10rem" fit="contain" radius="10rem"
        src="https://img.yzcdn.cn/public_files/2017/10/23/8690bb321356070e0b8c4404d087f8fd.png" />
    </div>
    <van-cell-group>
      <van-cell icon="points" title="个人信息" is-link to="user/userManager"/>
      <van-cell icon="gold-coin-o" title="账号与安全" is-link />
      <van-cell icon="gift-o" title="主题设置" is-link />
      <van-cell icon="gift-o" title="退出登录" is-link @click="showLogout" />
    </van-cell-group>
  </div>
  <Logout :visible="showLogoutFlag" @select="logout"></Logout>
  <Tabbar :data="useTabBar"></Tabbar>
</template>

<script lang="ts" setup>
import Logout from './logout/index.vue'
import Tabbar from '@/views/home/tabbar/index.vue';

let showLogoutFlag = ref<boolean>(false);

const showLogout = () => {
  showLogoutFlag.value = true;
}

const logout = (v: boolean) => {
  showLogoutFlag.value = v;
}
</script>

<style lang="scss">
.user {
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
</style>
