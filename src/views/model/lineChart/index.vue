<template>
  <chart :options="options" :width="props.width" :height="props.height" />
</template>

<script setup lang="ts">
import { barItem } from "@/views/model/chart/bar";

const props = defineProps({
  config: {
    type: Object as PropType<barItem>,
    default: () => {},
  },
  title: {
    type: String,
    default: "title",
  },
  tooltip: {
    type: Object,
    default: {},
  },
  data: {
    type: Array,
    default: [],
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

const setOption = (data: any[]) => {
  let { xAxis, yTitle, yNameGap, tooltip, color, xTile } = props.config;
  if (data) {
    options.value = {
      title: {
        text: props.title,
        left: "center",
      },
      grid: { left: "50%" },
      color: [
        "#55aaff",
        "#ff9933",
        "#5555ff",
        "#aa55ff",
        "#dd4444",
        "#bb2222",
        "#dd4488",
        "#22ff99",
        "#ffcc66",
        "#7777dd",
        "rgb(217, 0, 27)",
        "#777fff",
      ],
      tooltip: tooltip || {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xAxis ? xAxis : [],
        axisTick: {
          alignWithLabel: true,
        },
        name: xTile ? xTile : "",
      },
      yAxis: {
        type: "value",
        name: yTitle ? yTitle : "",
        nameLocation: "end",
        nameGap: yNameGap ? yNameGap : 28,
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        splitNumber: 4,
        lineStyle: {
          type: "dashed",
        },
        nameTextStyle: {
          padding: [0, 0, 0, -40], // [上, 右, 下, 左] 调整位置
        },
      },
      series: [
        {
          type: "line",
          data: data,
          smooth: true,
          showSymbol: 0,
          itemStyle: {
            normal: {
              color: color,
              lineStyle: {
                type: "line",
                color: color,
              },
            },
          },
        },
      ],
    };
  }
};

const chartOption = {
  title: {
    text: "",
    left: "center",
  },
  color: [] as string[],
  tooltip: {} as Object,
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: [] as string[],
    axisTick: {
      alignWithLabel: true,
    },
    name: "",
  },
  grid: { left: "10%" },
  yAxis: {
    type: "value",
    name: [] as string | string[],
    nameLocation: "end",
    nameGap: 28,
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    splitNumber: 4,
    lineStyle: {
      type: "dashed",
    },
    nameTextStyle: {},
  },
  series: [] as any,
};

const options = ref(chartOption);

watch(
  () => props.data,
  () => {
    setOption(props.data);
  },
  { deep: true, flush: "post" }
);

onMounted(() => {
  setOption(props.data);
});
</script>

<style lang="less" scoped></style>
