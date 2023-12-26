<template>
    <navBar :info="info"></navBar>
    <van-form @submit="onSubmit" :rules="rulesRef" required="auto">
        <van-cell-group>
            <van-field v-model="formInfo.name" name="name" :label="label.name + '：'"
                :placeholder="'请输入' + label.name" :rules="rulesRef.name" :maxlength="name" />
            <van-field v-model="formInfo.path" name="path" :label="label.path + '：'"
                :placeholder="'请输入' + label.path" :rules="rulesRef.path" :maxlength="path" />
            <van-field v-model="formInfo.title" name="title" :label="label.title + '：'"
                :placeholder="'请输入' + label.title" :rules="rulesRef.title" :maxlength="title" />
            <van-field v-model="formInfo.component" name="component" :label="label.component + '：'"
                :placeholder="'请输入' + label.component" :rules="rulesRef.component" :maxlength="component" />
            <van-field v-model="formInfo.redirect" name="redirect" :label="label.redirect + '：'"
                :placeholder="'请输入' + label.redirect" :rules="rulesRef.redirect" :maxlength="redirect" />
            <van-field v-model="formInfo.icon" name="icon" :label="label.icon + '：'"
                :placeholder="'请输入' + label.icon" :rules="rulesRef.icon" :maxlength="icon" />
            <van-field v-model="hideInMenuName" name="hideInMenu" :label="label.hideInMenu + '：'"
                :placeholder="'请输入' + label.hideInMenu" :rules="rulesRef.hideInMenu" @click="choose('hideInMenu')" readonly />
            <van-field v-model="formInfo.parentId" name="parentId" :label="label.parentId + '：'"
                :placeholder="'请输入' + label.parentId" :rules="rulesRef.parentId" :maxlength="parentId" />
            <van-field v-model="formInfo.summary" name="summary" :label="label.summary + '：'"
                :placeholder="'请输入' + label.summary" :rules="rulesRef.summary" :maxlength="summary" />
            <van-field v-model="statusName" name="status" :label="label.status + '：'"
                :placeholder="'请输入' + label.status" :rules="rulesRef.status" @click="choose('status')" readonly />
            <van-field v-model="formInfo.orderBy" name="orderBy" :label="label.orderBy + '：'"
                :placeholder="'请输入' + label.orderBy" :rules="rulesRef.orderBy" :maxlength="orderBy" />
            <selectPop :info="popInfo" @selectInfo="selectInfo" @cancelInfo="cancelInfo"></selectPop>
        </van-cell-group>
        <div class="subButton">
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
import { showFailToast, showSuccessToast } from 'vant';
import { addOrEditMenuInfo, getMenuInfoDetail } from '@/api/user/menuInfo/menuInfoTs';
import { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from "@/api/finance/dict/dictManager";
import selectPop from '@/views/common/pop/selectPop.vue';
import { label, rulesRef } from './menuInfoDetailTs';

let route = useRoute();
let router = useRouter();
const info = ref<any>({
    title: route?.meta?.title || '菜单管理表',
});

let formInfo = ref<any>({});

let popInfo = ref<Info>({ showFlag: false });

let hideInMenuName = ref<string>("");

let hideInMenuInfo = ref<Info>({
    label: "hideInMenu",
    labelName: label.hideInMenu,
    rule: rulesRef.hideInMenu,
    customFieldName: {
        text: "typeName",
        value: "typeCode",
    },
    selectValue: formInfo.value.hideInMenu,
});
let statusName = ref<string>("");

let statusInfo = ref<Info>({
    label: "status",
    labelName: label.status,
    rule: rulesRef.status,
    customFieldName: {
        text: "typeName",
        value: "typeCode",
    },
    selectValue: formInfo.value.status,
});

const choose = (type: string) => {
    switch (type) {
        case 'hideInMenu':
            popInfo.value = hideInMenuInfo.value;
            break;
        case 'status':
            popInfo.value = statusInfo.value;
            break;
    }
    popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string) => {
    popInfo.value.showFlag = false;
    switch (type) {
        case 'hideInMenu':
           formInfo.value.hideInMenu = value;
           hideInMenuName.value = name;
           break;
        case 'status':
           formInfo.value.status = value;
           statusName.value = name;
           break;
    }
};

const cancelInfo = () => {
    popInfo.value.showFlag = false;
};

const getListName = (list: any[], value: any, code: string, name: string) => {
   if (!list?.length) {
    return "";
   }
   let listName = "";
   list.forEach((item) => {
     if (item[code] == value) {
       listName = item[name];
     }
   });
   return listName;
};

function getDictInfoList(res: any) {
   if (res.code == "200") {
     hideInMenuInfo.value.list = res.data.filter(
       (item: { belongTo: string }) => item.belongTo == "true_or_false"
     );
     hideInMenuName.value = getListName(
         hideInMenuInfo.value.list || [],
         formInfo.value.hideInMenu,
         "typeCode",
         "typeName"
     );
     statusInfo.value.list = res.data.filter(
       (item: { belongTo: string }) => item.belongTo == "is_valid"
     );
     statusName.value = getListName(
         statusInfo.value.list || [],
         formInfo.value.status,
         "typeCode",
         "typeName"
     );
   } else {
     showFailToast(res?.message || "查询失败，请联系管理员!");
   }
}


const onSubmit = () => {
    let method = 'post';
    if (formInfo.value.id) {
        method = 'put'
    }
    addOrEditMenuInfo(method, formInfo.value).then((res: any) => {
        if (res?.code == '200') {
            showSuccessToast(res?.message || '保存成功!');
            router.push({ path: 'user/menuInfo' });
        } else {
            showFailToast (res?.message || '保存失败，请联系管理员!');
        }
    });
};

function init() {
    let id: any = route?.query?.id;
    if (id) {
        Promise.all([
            getMenuInfoDetail(id || '-1'),
            getDictList("true_or_false,is_valid"),
        ]).then((res: any) => {
            if (res[0].code == '200') {
                formInfo.value = res[0].data;
            } else {
                showFailToast(res?.message || '查询详情失败，请联系管理员!')
            }
            getDictInfoList(res[1]);
        }).catch(() => {
            showFailToast('系统问题，请联系管理员！')
        });
    } else {
        getDictList("true_or_false,is_valid").then((res: any) => {
            getDictInfoList(res);
        });
        formInfo.value = {
        };
    }
}

init();
</script>
<style lang='scss' scoped>
.subButton {
   margin: 16px;
}
</style>