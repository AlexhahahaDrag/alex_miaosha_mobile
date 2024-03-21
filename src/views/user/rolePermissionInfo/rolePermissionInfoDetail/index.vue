<template>
    <NavBar :info="info"></NavBar>
    <van-form @submit="onSubmit" :rules="rulesRef" required="auto">
        <van-cell-group>
            <van-field v-model="formInfo.roleId" name="roleId" :label="label.roleId + '：'"
                :placeholder="'请输入' + label.roleId" :rules="rulesRef.roleId" :maxlength="128" />
            <van-field v-model="formInfo.permissionId" name="permissionId" :label="label.permissionId + '：'"
                :placeholder="'请输入' + label.permissionId" :rules="rulesRef.permissionId" :maxlength="128" />
            <van-field v-model="formInfo.summary" name="summary" :label="label.summary + '：'"
                :placeholder="'请输入' + label.summary" :rules="rulesRef.summary" :maxlength="200" />
            <van-field v-model="statusName" name="status" :label="label.status + '：'"
                :placeholder="'请输入' + label.status" :rules="rulesRef.status" @click="choose('status')" readonly />
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
import { showFailToast, showSuccessToast } from 'vant';
import { addOrEditRolePermissionInfo, getRolePermissionInfoDetail } from '@/api/user/rolePermissionInfo/rolePermissionInfoTs';
import { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from "@/api/finance/dict/dictManager";
import { label, rulesRef } from './rolePermissionInfoDetailTs';

let route = useRoute();
let router = useRouter();
const info = ref<any>({
    title: route?.meta?.title || '角色权限信息表',
    leftPath: '/user/rolePermissionInfo',
});

let formInfo = ref<any>({});

let popInfo = ref<Info>({ showFlag: false });

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
        case 'status':
            popInfo.value = statusInfo.value;
            break;
    }
    popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string) => {
    popInfo.value.showFlag = false;
    switch (type) {
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
   if (res?.code == "200") {
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
    addOrEditRolePermissionInfo(method, formInfo.value).then((res: any) => {
        if (res?.code == '200') {
            showSuccessToast(res?.message || '保存成功!');
            router.push({ path: '/user/rolePermissionInfo' });
        } else {
            showFailToast (res?.message || '保存失败，请联系管理员!');
        }
    });
};

function init() {
    let id: any = route?.query?.id;
    if (id) {
        Promise.all([
            getRolePermissionInfoDetail(id || '-1'),
            getDictList("is_valid"),
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
        getDictList("is_valid").then((res: any) => {
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