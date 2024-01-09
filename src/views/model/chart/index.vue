<template>
  <div :id="id" :style="style" />
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { nanoid } from "nanoid";
//import dark from './dark';
//主题
import "echarts/theme/infographic";

const props = defineProps({
  options: {
    type: Object,
    default: () => {
      return {};
    },
  },
  width: {
    type: String,
    default: "600px",
  },
  height: {
    type: String,
    default: "400px",
  },
});

const id = ref(`vue-echarts-${nanoid()}`);

const style = ref({
  height: props.height,
  width: props.width,
});
let chart: any = null;
const initEcharts = () => {
  disposeChart();
  if (!chart) {
    chart = echarts.init(document.getElementById(id.value)!);
  } else {
    return;
  }
  if (!props.options) return;
  chart.setOption(props.options);
  window.addEventListener("resize", function () {
    chart.resize();
  });
};

const disposeChart = () => {
  if (chart) {
    window.addEventListener("resize", function () {
      chart.resize();
    });
  }
  chart?.dispose();
  chart = null;
};
onMounted(() => {
  watch(
    () => props.options,
    () => {
      chart?.setOption(props.options);
    },
    { deep: true, flush: "post" }
  );
  initEcharts();
});
onUnmounted(() => {
    disposeChart();
});
</script>
