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
    default: [[]],
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
  let { xAxis, yTitle, tooltip, xTile, dataType } = props.config;
  if (data?.length) {
    let yAxis = [] as any[];
    let series = [] as any[];
    for (let i = 0; i < data.length; i++) {
      let max = getMax(Math.max(...data[i]));
      let min = getMin(Math.min(...data[i]));
      yAxis.push({
        type: "value",
        name: yTitle ? yTitle[i] : "",
        min: min,
        max: max,
        nameLocation: "center",
        nameGap: 25,
        interval: (max - min) / 5,
        axisLabel: {
          // 使用formatter来定义如何显示标签
          formatter: function (value: number) {
            if (value >= 10000) {
              return (value / 1000).toFixed(1) + "k";
            } else {
              return value;
            }
          },
        },
      });
      series.push({
        type: dataType ? dataType[i] : "bar",
        data: data[i],
        name: yTitle ? yTitle[i] : "",
        yAxisIndex: i,
        showSymbol: 0,
      });
    }
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
        name: xTile ? xTile : "",
      },
      yAxis,
      series,
    };
  }
};

const getMax = (num: number) => {
  if (num <= 5) {
    return 5;
  } else if (num <= 10) {
    return 10;
  } else if (num <= 100) {
    return Math.ceil(num / 5) * 5;
  }
  return getMax(num / 10) * 10;
};

const getMin = (num: number) => {
  if (num < 0) {
    return -getMax(-num);
  }
  if (num <= 5) {
    return 0;
  } else if (num <= 10) {
    return 5;
  } else if (num <= 100) {
    return Math.floor(num / 5) * 5;
  }
  return getMin(num / 10) * 10;
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
  legend: {
    data: [] as any[],
    icon: "roundRect",
    left: "right",
    itemHeight: 6,
    itemWidth: 18,
    textStyle: {
      fontSize: 14,
      lineHeight: 14,
      rich: {
        a: {
          verticalAlign: "middle",
        },
      },
      padding: [0, 0, -2, 0], //[上、右、下、左]
    },
  },
  yAxis: [
    {
      type: "value",
      name: "",
    },
  ],
  series: [] as any,
} as any;

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
