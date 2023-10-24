<template>
    {{ props.activeTab }}
</template>

<script setup lang="ts">
import { watch } from 'vue';

interface Props {
    activeTab: Number;
}

let props = defineProps<Props>();

watch(
    () => [props.activeTab],
    () => {
        console.log(`test2`)
    },
    { immediate: true },
);
</script>