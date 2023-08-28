<!-- <template>
    <van-pull-refresh v-model="loading" success-text="刷新成功" @refresh="onRefresh" style="min-height: 100vh;">
        <p>刷新次数: {{ count }}</p>
        <van-list>
            <van-cell v-for="item in list" :key="item" :title="item" />
        </van-list>
    </van-pull-refresh>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { showToast } from 'vant';
const count = ref(0);
const loading = ref(false);
const onRefresh = () => {
    setTimeout(() => {
        showToast('刷新成功');
        loading.value = false;
        count.value++;
    }, 1000);
};

let list = ref<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
for (let i = 0; i < 10; i++) {
    list.value.push(list.value.length + 1);
}
</script> -->
<template>
    <div>
      <van-pull-refresh
        @refresh="onRefresh"
        :pulling-text="'下拉可以刷新'"
        :loosing-text="'释放即可刷新'"
        :loading-text="'加载中...'"
      >
        <van-list>
          <van-cell v-for="(item, index) in list" :key="index">
            {{ item }}
          </van-cell>
        </van-list>
      </van-pull-refresh>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        list: [1, 2, 3], // 用于存放列表数据
      };
    },
    methods: {
      onRefresh() {
        // 这里模拟异步加载数据，实际中你可以从后端请求数据
        setTimeout(() => {
          // 假设从后端获取到了新的数据
          const newData = ['Item 1', 'Item 2', 'Item 3'];
          this.list = newData;
  
          // 告诉 PullRefresh 刷新完成
          this.$refs.pullRefresh.finishPullDown();
        }, 1000);
      },
    },
  };
  </script>
  