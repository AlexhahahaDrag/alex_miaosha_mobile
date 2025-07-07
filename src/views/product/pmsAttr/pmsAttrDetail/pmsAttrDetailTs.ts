export const label = reactive({
	attrName: '属性名',
	searchType: '是否需要检索[0-不需要，1-需要]',
	icon: '属性图标',
	valueSelect: '可选值列表[用逗号分隔]',
	attrType: '属性类型[0-销售属性，1-基本属性，2-既是销售属性又是基本属性]',
	enable: '启用状态[0 - 禁用，1 - 启用]',
	catelogId: '所属分类',
	showDesc: '快速展示【是否展示在介绍上；0-否 1-是】，在sku中仍然可以调整',
});

export const rulesRef = reactive({
	attrName: [
		{
			required: true,
			message: label.attrName + '不能为空！',
		},
	],
	searchType: [
		{
			required: true,
			message: label.searchType + '不能为空！',
		},
	],
	icon: [
		{
			required: true,
			message: label.icon + '不能为空！',
		},
	],
	valueSelect: [
		{
			required: true,
			message: label.valueSelect + '不能为空！',
		},
	],
	attrType: [
		{
			required: true,
			message: label.attrType + '不能为空！',
		},
	],
	enable: [
		{
			required: true,
			message: label.enable + '不能为空！',
		},
	],
	catelogId: [
		{
			required: true,
			message: label.catelogId + '不能为空！',
		},
	],
	showDesc: [
		{
			required: true,
			message: label.showDesc + '不能为空！',
		},
	],
});
