export interface ShopStockBatchData {
	id?: string;
	batchCode?: string;
	batchName?: string;
	isValid?: string;
	description?: string;
	title?: string;
}

export const label = reactive({
	batchCode: '批次编码',
	batchName: '批次名称',
	isValid: '状态',
	description: '描述',
});

export const rulesRef = reactive({
	batchCode: [
		{
			required: true,
			message: `${label.batchCode}不能为空！`,
		},
	],
	batchName: [
		{
			required: true,
			message: `${label.batchName}不能为空！`,
		},
	],
	isValid: [
		{
			required: true,
			message: `${label.isValid}不能为空！`,
		},
	],
});
