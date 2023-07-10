<template>
  <svg aria-hidden="true">
    <use :href="symbolId" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface SvgInfo {
  prefix?: string;
  name: string;
  color?: string;
}

const props = withDefaults(defineProps<SvgInfo>(), {
  prefix: "icon",
  color: "#333",
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);

const color = computed(() => props.color);
</script>
