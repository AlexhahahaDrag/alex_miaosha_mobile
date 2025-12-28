export const label = reactive({
	stockId: '库存id',
	attrCode: '商品属性编码',
	attrName: '商品属性名称',
	attrValue: '商品属性值',
	isValid: '状态',
	description: '描述',
});

export const rulesRef = reactive({
	stockId: [
		{
			required: true,
			message: `${label.stockId}不能为空！`,
		},
	],
	attrCode: [
		{
			required: true,
			message: `${label.attrCode}不能为空！`,
		},
	],
	attrName: [
		{
			required: true,
			message: `${label.attrName}不能为空！`,
		},
	],
	attrValue: [
		{
			required: true,
			message: `${label.attrValue}不能为空！`,
		},
	],
	isValid: [
		{
			required: true,
			message: `${label.isValid}不能为空！`,
		},
	],
	description: [
		{
			required: true,
			message: `${label.description}不能为空！`,
		},
	],
});
