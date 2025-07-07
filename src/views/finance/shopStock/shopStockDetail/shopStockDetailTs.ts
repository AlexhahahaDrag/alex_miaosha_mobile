export const label = reactive({
	shopName: '商品名称',
	shopCode: '商品编码',
	costAmount: '成本价',
	saleAmount: '零售价',
	isValid: '状态',
	saleDate: '进货日期',
	category: '类别',
	purchasePlace: '进货地点',
	saleNum: '数量',
	oldShopCode: '原商品编码',
	size: '尺码',
	style: '款式',
	color: '颜色',
	stockBatch: '批次',
});

export const rulesRef = reactive({
	shopName: [
		{
			required: true,
			message: label.shopName + '不能为空！',
		},
	],
	costAmount: [
		{
			required: true,
			message: label.costAmount + '不能为空！',
		},
		{ pattern: /^\d+(\.\d+)?$/, message: `请输入正确的成本价` },
	],
	saleAmount: [
		{
			required: true,
			message: label.saleAmount + '不能为空！',
		},
		{ pattern: /^\d+(\.\d+)?$/, message: `请输入正确的零售价` },
	],
	isValid: [
		{
			required: true,
			message: label.isValid + '不能为空！',
		},
	],
	saleDate: [
		{
			required: true,
			message: label.saleDate + '不能为空！',
		},
	],
	category: [
		{
			required: true,
			message: label.category + '不能为空！',
		},
	],
	purchasePlace: [
		{
			required: true,
			message: label.purchasePlace + '不能为空！',
		},
	],
	saleNum: [
		{
			required: true,
			message: label.saleNum + '不能为空！',
		},
		{ pattern: /^\d+(\.\d+)?$/, message: `请输入正确的数量` },
	],
	stockBatch: [
		{
			required: true,
			message: label.stockBatch + '不能为空！',
		},
	],
});
