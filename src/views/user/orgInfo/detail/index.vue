<template>
    <navBar :info="info"></navBar>
    <van-form @submit="onSubmit" :rules="rulesRef" required="auto">
        <van-cell-group>
            <van-field v-model="formInfo.orgCode" name="orgCode" :label="label.orgCode + '：'"
                :placeholder="'请输入' + label.orgCode" :rules="rulesRef.orgCode" :maxlength="255"/>
            <van-field v-model="formInfo.orgName" name="orgName" :label="label.orgName + '：'"
                :placeholder="'请输入' + label.orgName" :rules="rulesRef.orgName" :maxlength="512"/>
            <van-field v-model="formInfo.orgShortName" name="orgShortName" :label="label.orgShortName + '：'"
                :placeholder="'请输入' + label.orgShortName" :rules="rulesRef.orgShortName" :maxlength="512"/>
            <van-field v-model="formInfo.parentName" name="parentId" :label="label.parentId + '：'"
                :placeholder="'请输入' + label.parentId" readonly/>
            <van-field v-model="statusName" name="status" :label="label.status + '：'"
                :placeholder="'请输入' + label.status" :rules="rulesRef.status" @click="choose('status')" readonly />
            <van-field v-model="formInfo.summary" name="summary" :label="label.summary + '：'"
                :placeholder="'请输入' + label.summary" :rules="rulesRef.summary"  
                rows="2"
                type="textarea"
                :maxlength="2000"
                show-word-limit
                autosize/>
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
import navBar from '@/views/common/navBar/index.vue';
import { showFailToast, showSuccessToast } from 'vant';
import { addOrEditOrgInfo, getOrgInfoDetail } from '@/api/user/orgInfo/orgInfoTs';
import { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from "@/api/finance/dict/dictManager";
import selectPop from '@/views/common/pop/selectPop.vue';

let route = useRoute();
let router = useRouter();
const info = ref<any>({
    title: route?.meta?.title || '机构表',
    leftPath: '/user/orgInfo',
});

let formInfo = ref<any>({});

const label = reactive({
    orgCode: '机构编码',
    orgName: '机构名称',
    orgShortName: '机构简称',
    parentId: '父级机构',
    summary: '简介',
    status: '状态',
});

const rulesRef = reactive({
    orgCode: [
        {
            required: true,
            message: label.orgCode + '不能为空！',
        },
    ],
    orgName: [
        {
            required: true,
            message: label.orgName + '不能为空！',
        },
    ],
    orgShortName: [
        {
            required: true,
            message: label.orgShortName + '不能为空！',
        },
    ],
    summary: [
        {
            required: true,
            message: label.summary + '不能为空！',
        },
    ],
    status: [
        {
            required: true,
            message: label.status + '不能为空！',
        },
    ],
});

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
   if (res.code == "200") {
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
    addOrEditOrgInfo(method, formInfo.value).then((res: any) => {
        if (res?.code == '200') {
            showSuccessToast(res?.message || '保存成功!');
            router.push({ path: '/user/orgInfo' });
        } else {
            showFailToast (res?.message || '保存失败，请联系管理员!');
        }
    });
};

function init() {
    let id: any = route?.query?.id;
    if (id) {
        Promise.all([
            getOrgInfoDetail(id || '-1'),
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
            status: 1,
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