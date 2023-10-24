<template>
    <van-popup v-model:show="showFlag" position="bottom" :style="{ width: '100%' }" @click-overlay="onClickOverlay">
        <van-picker v-model="cur.selectValue" :title="cur.labelName" :columns="cur.list"
            :columns-field-names="customFieldName" @confirm="confirm" @cancel="cancel" />
    </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

export interface Info {
    label?: string;
    labelName?: string;
    rule?: any;
    list?: any[];
    selectValue?: any;
    showFlag?: boolean;
    customFieldName?: any;
}

interface Props {
    info: Info;
}

const emit = defineEmits(['selectInfo', 'cancelInfo']);

const props = defineProps<Props>();

let showFlag = ref<boolean>(false);

const confirm = ({ selectedOptions }) => {
    showFlag.value = false;
    emit('selectInfo', props.info.label, selectedOptions ? selectedOptions[0][customFieldName.value] : '',
        selectedOptions ? selectedOptions[0][customFieldName.text] : '');
};

const cancel = () => {
    showFlag.value = false;
    emit('cancelInfo', false);
};

const onClickOverlay = () => {
    cancel();
};

let customFieldName = ref<any>({
    text: 'typeName',
    value: 'typeCode',
});

let cur = ref<Info>({});

watch(
    () => props.info.showFlag,
    () => {
        if (props.info.showFlag) {
            cur.value = props.info;
            console.log(`cur.value`, cur.value, props.info);
            showFlag.value = props.info.showFlag;
            customFieldName = props.info.customFieldName;
        }
    })
</script>