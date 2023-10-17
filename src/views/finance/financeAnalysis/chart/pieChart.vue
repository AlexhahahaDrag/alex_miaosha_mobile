<template>
  <chart :options="options" :width="props.width" :height="props.height" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import chart from "@/views/model/chart/index.vue";

const props = defineProps({
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

const options = computed(() => {
  return {
    title: {
      text: props.title,
      left: "center",
    },
    tooltip: props.tooltip || {
      trigger: "item",
    },
    legend: {
      bottom: 10,
      left: "center",
    },
    series: [
      {
        name: "",
        type: "pie",
        radius: "50%",
        data: props.data || [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
});
</script>
