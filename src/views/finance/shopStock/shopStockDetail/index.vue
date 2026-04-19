<template>
	<NavBar :info="info"></NavBar>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="formInfo.shopName"
				name="shopName"
				:label="label.shopName + '：'"
				:placeholder="'请输入' + label.shopName"
				:rules="rulesRef.shopName"
				:maxlength="255"
			/>
			<van-field
				v-model="formInfo.oldShopCode"
				name="oldShopCode"
				:label="label.oldShopCode + '：'"
				:maxlength="255"
			/>
			<van-field
				v-model="formInfo.shopCode"
				name="shopCode"
				:label="label.shopCode + '：'"
				:maxlength="255"
				:readonly="true"
			/>
			<van-field
				v-model="formInfo.costAmount"
				name="costAmount"
				:label="label.costAmount + '：'"
				:placeholder="'请输入' + label.costAmount"
				:rules="rulesRef.costAmount"
				:maxlength="10"
			/>
			<van-field
				v-model="formInfo.saleAmount"
				name="saleAmount"
				:label="label.saleAmount + '：'"
				:placeholder="'请输入' + label.saleAmount"
				:rules="rulesRef.saleAmount"
				:maxlength="10"
			/>
			<van-field
				v-model="isValidName"
				name="isValid"
				:label="label.isValid + '：'"
				:placeholder="'请输入' + label.isValid"
				:rules="rulesRef.isValid"
				@click="choose('isValid')"
				readonly
			/>
			<van-field
				v-model="categoryName"
				name="category"
				:label="label.category + '：'"
				:placeholder="'请输入' + label.category"
				:rules="rulesRef.category"
				@click="choose('category')"
				readonly
			/>
			<van-field
				v-model="purchasePlaceName"
				name="purchasePlace"
				:label="label.purchasePlace + '：'"
				:placeholder="'请输入' + label.purchasePlace"
				:rules="rulesRef.purchasePlace"
				@click="choose('purchasePlace')"
				readonly
			/>
			<van-field
				v-model="formInfo.saleNum"
				name="saleNum"
				:label="label.saleNum + '：'"
				:placeholder="'请输入' + label.saleNum"
				:rules="rulesRef.saleNum"
				:maxlength="10"
			/>
			<van-field
				v-model="formInfo.size"
				name="size"
				:label="label.size + '：'"
			></van-field>
			<van-field
				v-model="formInfo.color"
				name="color"
				:label="label.color + '：'"
			></van-field>
			<van-field
				v-model="formInfo.style"
				name="style"
				:label="label.style + '：'"
			></van-field>
			<van-field
				v-model="stockBatchName"
				name="stockBatch"
				:label="label.stockBatch + '：'"
				:placeholder="'请输入' + label.stockBatch"
				:rules="rulesRef.stockBatch"
				@click="choose('stockBatch')"
				readonly
			/>
			<selectPop
				:info="popInfo"
				@select-info="selectInfo"
				@cancel-info="cancelInfo"
			></selectPop>
			<datePop
				:info="chooseDateInfo"
				@select-info="selectDateInfo"
				@cancel-info="cancelDateInfo"
			></datePop>
		</van-cell-group>
		<div class="subButton">
			<van-button
				round
				block
				type="primary"
				native-type="submit"
			>
				提交
			</van-button>
		</div>
	</van-form>
</template>

<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import type { ShopStockInfo } from '../shopStockTs';
import { label, rulesRef } from './shopStockDetailTs';
import { getListName } from '@/views/common/config';
import { addOrEditShopStock, getShopStockDetail } from '@/api/finance/shopStock/shopStockTs';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/api/finance/dict/dictManager';

const route = useRoute();
const router = useRouter();
const info = ref<any>({
	title: route?.meta?.title || '商店库存表',
	leftPath: '/finance/shopStock',
});

const formInfo = ref<ShopStockInfo>({});

const popInfo = ref<Info>({ showFlag: false });

const isValidName = ref<string>('');

const isValidInfo = ref<Info>({
	label: 'isValid',
	labelName: label.isValid,
	rule: rulesRef.isValid,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.isValid,
});
const categoryName = ref<string>('');

const categoryInfo = ref<Info>({
	label: 'category',
	labelName: label.category,
	rule: rulesRef.category,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.category,
});
const purchasePlaceName = ref<string>('');

const purchasePlaceInfo = ref<Info>({
	label: 'purchasePlace',
	labelName: label.purchasePlace,
	rule: rulesRef.purchasePlace,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.purchasePlace,
});

const stockBatchName = ref<string>('');

const stockBatchInfo = ref<Info>({
	label: 'stockBatch',
	labelName: label.stockBatch,
	rule: rulesRef.stockBatch,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.stockBatch,
});

const choose = (type: string) => {
	switch (type) {
		case 'isValid':
			popInfo.value = isValidInfo.value;
			break;
		case 'category':
			popInfo.value = categoryInfo.value;
			break;
		case 'purchasePlace':
			popInfo.value = purchasePlaceInfo.value;
			break;
		case 'stockBatch':
			popInfo.value = stockBatchInfo.value;
			break;
	}
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string) => {
	popInfo.value.showFlag = false;
	switch (type) {
		case 'isValid':
			formInfo.value.isValid = value;
			isValidName.value = name;
			break;
		case 'category':
			formInfo.value.category = value;
			categoryName.value = name;
			break;
		case 'purchasePlace':
			formInfo.value.purchasePlace = value;
			purchasePlaceName.value = name;
			break;
		case 'stockBatch':
			formInfo.value.stockBatch = value;
			stockBatchName.value = name;
			break;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

function getDictInfoList(res: any) {
	if (res?.code == '200') {
		isValidInfo.value.list = res.data.filter((item: { belongTo: string }) => item.belongTo == 'is_valid');
		isValidName.value = getListName(isValidInfo.value.list || [], formInfo.value.isValid, 'typeCode', 'typeName');
		categoryInfo.value.list = res.data.filter((item: { belongTo: string }) => item.belongTo == 'shop_category');
		categoryName.value = getListName(categoryInfo.value.list || [], formInfo.value.category, 'typeCode', 'typeName');
		purchasePlaceInfo.value.list = res.data.filter((item: { belongTo: string }) => item.belongTo == 'stock_place');
		purchasePlaceName.value = getListName(
			purchasePlaceInfo.value.list || [],
			formInfo.value.purchasePlace,
			'typeCode',
			'typeName',
		);
	} else {
		showFailToast(res?.message || '查询失败，请联系管理员!');
	}
}

const saleDateName = ref<string>('');
const saleDateInfo = ref<any>({
	label: 'saleDate',
	labelName: '进货日期',
	rule: rulesRef.saleDate,
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

const chooseDateInfo = ref<Info>({ showFlag: false });

const selectDateInfo = (date: Dayjs, dateName: string, type: string) => {
	switch (type) {
		case 'saleDate':
			formInfo.value.saleDate = date;
			saleDateName.value = dateName;
			break;
	}
	chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

const initInfoDate = (infoDate: string | Dayjs, type: string) => {
	if (infoDate) {
		switch (type) {
			case 'saleDate':
				saleDateName.value = dayjs(infoDate).format('YYYY年MM月DD');
				saleDateInfo.value.selectValue = infoDate;
				break;
		}
	}
};

const onSubmit = () => {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	addOrEditShopStock(method, formInfo.value).then((res: any) => {
		if (res?.code == '200') {
			showSuccessToast(res?.message || '保存成功!');
			router.push({ path: '/finance/shopStock' });
		} else {
			showFailToast(res?.message || '保存失败，请联系管理员!');
		}
	});
};

function init() {
	const id: any = route?.query?.id;
	const type: any = route?.query?.type;
	if (id) {
		Promise.all([getShopStockDetail(id || '-1'), getDictList('is_valid,shop_category,stock_place')])
			.then((res: any) => {
				if (res[0].code == '200') {
					formInfo.value = res[0].data;
					formInfo.value.saleDate = dayjs(formInfo.value.saleDate);
					// 如果是复制，则删除id
					if (type === 'copy') {
						formInfo.value.id = null;
					}
					initInfoDate(formInfo.value.saleDate, 'saleDate');
				} else {
					showFailToast(res?.message || '查询详情失败，请联系管理员!');
				}
				getDictInfoList(res[1]);
			})
			.catch(() => {
				showFailToast('系统问题，请联系管理员！');
			});
	} else {
		getDictList('is_valid,shop_category,stock_place').then((res: any) => {
			getDictInfoList(res);
		});
		formInfo.value = {
			saleDate: dayjs(),
			isValid: '1',
			purchasePlace: 'sz',
		};
		initInfoDate(formInfo.value?.saleDate || dayjs(), 'saleDate');
	}
}

init();
</script>
<style lang="less" scoped>
.subButton {
	margin: 16px;
}
</style>
