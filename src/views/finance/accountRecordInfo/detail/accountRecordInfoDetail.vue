<template>
    <navBar :info="info"></navBar>
    <van-form @submit="onSubmit" :rules="rulesRef">
        <van-cell-group>
            <van-field v-model="formInfo.name" name="name" :label="label.name + '：'"
                :placeholder="'请输入' + label.name" :rules="rulesRef.name" />
            <van-field v-model="avliDateName" name="avliDate" :label="label.avliDate + '：'"
                :placeholder="'请输入' + label.avliDate" :rules="rulesRef.avliDate" @click="chooseDate('avliDate')" readonly />
            <van-field v-model="formInfo.amount" name="amount" :label="label.amount + '：'"
                :placeholder="'请输入' + label.amount" :rules="rulesRef.amount" />
            <van-field v-model="formInfo.account" name="account" :label="label.account + '：'"
                :placeholder="'请输入' + label.account" :rules="rulesRef.account" />
            <van-field v-model="formInfo.isSend" name="isSend" :label="label.isSend + '：'"
                :placeholder="'请输入' + label.isSend" :rules="rulesRef.isSend" />
            <!--  <van-field v-model="belongToName" name="belongTo" :label="label.belongTo + '：'"
                :placeholder="'请输入' + label.belongTo" :rules="rulesRef.belongTo" @click="choose('belongTo')" readonly /> -->
            <!--   <selectPop :info="popInfo" @selectInfo="selectInfo" @cancelInfo="cancelInfo"></selectPop> -->
            <datePop :info="chooseDateInfo" @selectInfo="selectDateInfo" @cancelInfo="cancelDateInfo"></datePop>
        </van-cell-group>
        <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit">
                提交
            </van-button>
        </div>
    </van-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from "vue-router";
import navBar from '@/views/common/navBar/index.vue';
import dayjs, { Dayjs } from 'dayjs';
// import selectPop from '@/views/common/pop/selectPop.vue';
import { Info } from '@/views/common/pop/selectPop.vue';
import datePop from '@/views/common/pop/datePop.vue';
import { showFailToast, showSuccessToast } from 'vant';
import { addOrEditAccountRecordInfo, getAccountRecordInfoDetail } from '@/api/finance/accountRecordInfo/accountRecordInfoTs';

let route = useRoute();
let router = useRouter();
const info = ref<any>({
    title: route?.name || '',
});
// TODO 修改成类型
let formInfo = ref<any>({});

const label = reactive({
    name: '名称不能为空！',
    avliDate: '有效期不能为空！',
    amount: '金额不能为空！',
    account: '账号不能为空！',
    isSend: '是否发送提醒不能为空！',
});

const rulesRef = reactive({
    name: [
        {
            required: true,
            message: '名称不能为空！',
        },
    ],
    avliDate: [
        {
            required: true,
            message: '有效期不能为空！',
        },
    ],
    amount: [
        {
            required: true,
            message: '金额不能为空！',
        },
    ],
    account: [
        {
            required: true,
            message: '账号不能为空！',
        },
    ],
    isSend: [
        {
            required: true,
            message: '是否发送提醒不能为空！',
        },
    ],
});

// let popInfo = ref<Info>({ showFlag: false });

// const choose = (type: string) => {
//    switch (type) {
//        case 'belongTo':
//            popInfo.value = belongToInfo.value;
//            break;
//    }
//    popInfo.value.showFlag = true;
// };

// const selectInfo = (type: string, value: any, name: string) => {
//    popInfo.value.showFlag = false;
//    switch (type) {
//        case 'belongTo':
//            formInfo.value.belongTo = value;
//            belongToName.value = name;
//           break;
//    }
// };

// const cancelInfo = () => {
//    popInfo.value.showFlag = false;
// };

let avliDateName = ref<string>('');
let avliDateInfo = ref<any>({
    label: 'avliDate',
    labelName: 'field.comment',
    rule: rulesRef.avliDate,
    selectValue: dayjs(),
    showFlag: false,
    formatter: (type: string, option: any) => {
        if (type === 'year') {
            option.text += '年';
        }
        if (type === 'month') {
            option.text += '月';
        }
        if (type === 'day') {
            option.text += '日';
        }
        return option;
    },
});

let chooseDateInfo = ref<Info>({ showFlag: false });

const chooseDate = (type: string) => {
    chooseDateInfo.value.showFlag = true;
    switch (type) {
        case 'avliDate':
            chooseDateInfo.value = avliDateInfo.value
            break;
    }
};

const selectDateInfo = (date: Dayjs, dateName: string, type: string) => {
    switch(type) {
        case 'avliDate':
            formInfo.value.avliDate = date;
            avliDateName.value = dateName;
            break;
    }
    chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = () => {
    chooseDateInfo.value.showFlag = false;
}

const initInfoDate = (infoDate: Dayjs, type: string) => {
    if (infoDate) {
        switch(type) {
            case 'avliDate':
                avliDateName.value = infoDate.format('YYYY-MM-DD');
                avliDateInfo.value.selectValue = infoDate;
                break;
        }
    }
}

const onSubmit = () => {
    let method = 'post';
    if (formInfo.value.id) {
        method = 'put'
    }
    addOrEditAccountRecordInfo(method, formInfo.value).then((res: any) => {
        if (res?.code == '200') {
            showSuccessToast(res?.message || '保存成功!');
            router.push({ path: '/finance/financeManager' });
        } else {
            showFailToast (res?.message || '保存失败，请联系管理员!');
        }
    });
};

// const getListName = (list: any[], value: any, code: string, name: string) => {
//    if (!list?.length) {
//        return '';
//    }
//    let listName = '';
//    list.forEach(item => {
//        if (item[code] == value) {
//            listName = item[name];
//        }
//    });
//    return listName;
// };

function init() {
    let id: any = route?.query?.id;
    if (id) {
        getAccountRecordInfoDetail(id || '-1').then((res: any) => {
            if (res.code == '200') {
                formInfo.value = res.data;
                initInfoDate(formInfo.value.avliDate, 'avliDate');
            } else {
                showFailToast(res?.message || '查询详情失败，请联系管理员!')
            }
        }).catch(() => {
            showFailToast('系统问题，请联系管理员！')
        });
    } else {
        formInfo.value = {
            avliDate: dayjs(),
        };
        initInfoDate(formInfo.value.avliDate, 'avliDate');
    }
}

init();
</script>
<style lang='scss' scoped>
</style>