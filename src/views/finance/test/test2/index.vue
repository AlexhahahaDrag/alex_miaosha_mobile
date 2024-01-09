<template>
    {{ props.activeTab }}
</template>

<script setup lang="ts">

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