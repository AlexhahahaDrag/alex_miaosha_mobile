<template>
    <navBar :info="info"></navBar>
    <van-form @submit="onSubmit" :rules="rulesRef" required="auto">
        <van-cell-group inset>
            <van-field v-model="formInfo.name" name="name" :label="label.name + '：'" :placeholder="'请输入' + label.name"
                :rules="rulesRef.name" />
            <van-field v-model="formInfo.typeCode" name="typeCode" :label="label.typeCode + '：'"
                :placeholder="'请输入' + label.typeCode" :rules="rulesRef.typeCode" />
            <van-field v-model="formInfo.amount" type="number" name="amount" :label="label.amount + '：'"
                :placeholder="'请输入' + label.amount" :rules="rulesRef.amount" />
            <van-field v-model="fromSourceName" name="fromSource" :label="label.fromSource + '：'"
                :placeholder="'请输入' + label.fromSource" :rules="rulesRef.fromSource" @click="choose('fromSource')"
                readonly />
            <van-field v-model="incomeAndExpensesName" name="incomeAndExpenses" :label="label.incomeAndExpenses + '：'"
                :placeholder="'请输入' + label.incomeAndExpenses" :rules="rulesRef.incomeAndExpenses"
                @click="choose('incomeAndExpenses')" readonly />
            <van-field v-model="isValidName" name="isValid" :label="label.isValid + '：'"
                :placeholder="'请输入' + label.isValid" :rules="rulesRef.isValid" @click="choose('isValid')" readonly />
            <van-field v-model="infoDateName" name="infoDate" :label="label.infoDate + '：'"
                :placeholder="'请输入' + label.infoDate" :rules="rulesRef.infoDate" @click="chooseDate" readonly />
            <van-field v-model="belongToName" name="belongTo" :label="label.belongTo + '：'"
                :placeholder="'请输入' + label.belongTo" :rules="rulesRef.belongTo" @click="choose('belongTo')" readonly />
            <selectPop :info="popInfo" @selectInfo="selectInfo" @cancelInfo="cancelInfo"></selectPop>
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
import { getDictList } from "@/api/finance/dict/dictManager";
import { getUserManagerList } from "@/api/user/userManager";
import { useUserStore } from "@/store/modules/user/user";
import selectPop from '@/views/common/pop/selectPop.vue';
import { Info } from '@/views/common/pop/selectPop.vue';
import datePop from '@/views/common/pop/datePop.vue';
import { showFailToast ,showSuccessToast } from 'vant';
import { addOrEditFinanceManger, getFinanceMangerDetail } from '@/api/finance/financeManager';

let route = useRoute();
let router = useRouter();
let userInfo = useUserStore()?.getUserInfo;
const info = ref<any>({
    title: route?.name || '财务明细',
});
let formInfo = ref<any>({});

const label = reactive({
    name: '名称',
    amount: '金额',
    typeCode: '类别',
    fromSource: '支付方式',
    incomeAndExpenses: '收支类型',
    isValid: '状态',
    infoDate: '业务时间',
    belongTo: '属于',
});

const rulesRef = reactive({
    name: [
        {
            required: true,
            message: '名称不能为空！',
        },
    ],
    amount: [
        {
            required: true,
            message: '金额不能为空！',
        },
    ],
    typeCode: [
        {
            required: true,
            message: '类别不能为空！',
        },
    ],
    fromSource: [
        {
            required: true,
            message: '支付方式不能为空！',
        },
    ],
    incomeAndExpenses: [
        {
            required: true,
            message: '收支类型不能为空！',
        },
    ],
    isValid: [
        {
            required: true,
            message: '状态不能为空！',
        },
    ],
    infoDate: [
        {
            required: true,
            message: '业务时间不能为空！',
        },
    ],
    belongTo: [
        {
            required: true,
            message: '属于不能为空！',
        },
    ],
});

let popInfo = ref<Info>({ showFlag: false });

let fromSourceInfo = ref<Info>({
    label: 'fromSource',
    labelName: '支付方式',
    rule: rulesRef.fromSource,
    customFieldName: {
        text: 'typeName',
        value: 'typeCode',
    },
    selectValue: formInfo.value.fromSource
});

let incomeAndExpensesInfo = ref<Info>({
    label: 'incomeAndExpenses',
    labelName: '收支类型',
    rule: rulesRef.incomeAndExpenses,
    customFieldName: {
        text: 'typeName',
        value: 'typeCode',
    },
    selectValue: formInfo.value.incomeAndExpenses
});

let isValidInfo = ref<Info>({
    label: 'isValid',
    labelName: '状态',
    rule: rulesRef.isValid,
    customFieldName: {
        text: 'typeName',
        value: 'typeCode',
    },
    selectValue: formInfo.value.isValid
});

let belongToInfo = ref<Info>({
    label: 'belongTo',
    labelName: '属于',
    rule: rulesRef.belongTo,
    customFieldName: {
        text: 'nickName',
        value: 'id',
    },
    selectValue: formInfo.value.belongTo
});

const choose = (type: string) => {
    switch (type) {
        case 'fromSource':
            popInfo.value = fromSourceInfo.value;
            break;
        case 'incomeAndExpenses':
            popInfo.value = incomeAndExpensesInfo.value;
            break;
        case 'isValid':
            popInfo.value = isValidInfo.value;
            break;
        case 'belongTo':
            popInfo.value = belongToInfo.value;
            break;
    }
    popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string) => {
    popInfo.value.showFlag = false;
    switch (type) {
        case 'fromSource':
            formInfo.value.fromSource = value;
            fromSourceName.value = name;
            break;
        case 'incomeAndExpenses':
            formInfo.value.incomeAndExpenses = value;
            incomeAndExpensesName.value = name;
            break;
        case 'isValid':
            formInfo.value.isValid = value;
            isValidName.value = name;
            break;
        case 'belongTo':
            formInfo.value.belongTo = value;
            belongToName.value = name;
            break;
    }
};

const cancelInfo = () => {
    popInfo.value.showFlag = false;
};

let chooseDateInfo = ref<any>({
    label: 'infoDate',
    labelName: '业务日期',
    rule: rulesRef.infoDate,
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

let infoDateName = ref<string>('');

const chooseDate = () => {
    chooseDateInfo.value.showFlag = true;
};

const selectDateInfo = (date: Dayjs, dateName: string) => {
    formInfo.value.infoDate = date;
    infoDateName.value = dateName;
    chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = () => {
    chooseDateInfo.value.showFlag = false;
}

let fromSourceName = ref<string>('');
let incomeAndExpensesName = ref<string>('');
let isValidName = ref<string>('');
let belongToName = ref<string>('');

const onSubmit = () => {
    let method = 'post';
    if (formInfo.value.id) {
        method = 'put'
    }
    addOrEditFinanceManger(method, formInfo.value).then((res: any) => {
        if (res?.code == '200') {
            showSuccessToast(res?.message || '保存成功!');
            // todo 是否修改成返回列表对应的位置
            router.push({ path: '/finance/financeManager' });
        } else {
            showFailToast (res?.message || '保存失败，请联系管理员!');
        }
    });
};

function getDictInfoList(res: any) {
    if (res.code == "200") {
        fromSourceInfo.value.list = res.data.filter(
            (item: { belongTo: string }) => item.belongTo == "pay_way"
        );
        incomeAndExpensesInfo.value.list = res.data.filter(
            (item: { belongTo: string }) => item.belongTo == "income_expense_type"
        );
        isValidInfo.value.list = res.data.filter(
            (item: { belongTo: string }) => item.belongTo == "is_valid"
        );
        fromSourceName.value = getListName(fromSourceInfo.value.list || [], formInfo.value.fromSource, 'typeCode', 'typeName');
        incomeAndExpensesName.value = getListName(incomeAndExpensesInfo.value.list || [], formInfo.value.incomeAndExpenses, 'typeCode', 'typeName');
        isValidName.value = getListName(isValidInfo.value.list || [], formInfo.value.isValid, 'typeCode', 'typeName');
    } else {
        showFailToast (res?.message || '查询失败，请联系管理员!')
    }
}

const getListName = (list: any[], value: any, code: string, name: string) => {
    if (!list?.length) {
        return '';
    }
    let listName = '';
    list.forEach(item => {
        if (item[code] == value) {
            listName = item[name];
        }
    });
    return listName;
};

function getUserInfoList(res: any) {
    if (res.code == "200") {
        belongToInfo.value.list = res.data;
        belongToName.value = getListName(res.data, formInfo.value.belongTo, 'id', 'nickName');
    } else {
        showFailToast (res[2]?.message || '查询失败，请联系管理员!')
    }
}

const initInfoDate = (infoDate: Dayjs) => {
    if (infoDate) {
        infoDateName.value = infoDate.format('YYYY-MM-DD');
        chooseDateInfo.value.selectValue = infoDate;
    }
}

function init() {
    let id: any = route?.query?.id;
    if (id) {
        Promise.all([getFinanceMangerDetail(id || '-1'),
        getUserManagerList({}),
        getDictList('pay_way,income_expense_type,is_valid')]).then((res: any[]) => {
            if (res[0].code == '200') {
                formInfo.value = res[0].data;
                formInfo.value.infoDate = dayjs(formInfo.value.infoDate);
                initInfoDate(formInfo.value.infoDate);
            } else {
                showFailToast (res[0]?.message || '查询详情失败，请联系管理员!')
            }
            getUserInfoList(res[1])
            getDictInfoList(res[2]);
        }).catch(() => {
            showFailToast ('系统问题，请联系管理员！')
        });
    } else {
        formInfo.value = {
            isValid: '1',
            incomeAndExpenses: "expense",
            infoDate: dayjs(),
            belongTo: userInfo ? userInfo.id + '' : '2',
            fromSource: 'wx',
        };
        //获取用户信息
        getUserManagerList({}).then((res: any) => { getUserInfoList(res) });
        //获取字典信息
        getDictList('pay_way,income_expense_type,is_valid').then((res: any) => { getDictInfoList(res) });
        initInfoDate(formInfo.value.infoDate);
    }

}

init();
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
</style>