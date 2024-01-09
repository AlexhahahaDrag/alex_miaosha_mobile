<template>
  <chart :options="options" :width="props.width" :height="props.height" />
</template>

<script setup lang="ts">
import { barItem } from "@/views/model/chart/bar";

const props = defineProps({
  config: {
    type: Object as PropType<barItem>,
    default: () => { },
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
        name: xTile ? xTile : '',
      },
      // legend: {
      //   data: legend || [1],
      //   icon: "roundRect",
      //   left: "right",
      //   itemHeight: 6,
      //   itemWidth: 18,
      //   textStyle: {
      //     fontSize: 14,
      //     lineHeight: 14,
      //     rich: {
      //       a: {
      //         verticalAlign: "middle",
      //       },
      //     },
      //     padding: [0, 0, -2, 0], //[上、右、下、左]
      //   },
      // },
      yAxis: {
        type: "value",
        name: yTitle ? yTitle : "",
        nameLocation: "center",
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
        }
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
    name: '',
  },
  yAxis: {
    type: "value",
    name: "",
    nameLocation: "center",
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
