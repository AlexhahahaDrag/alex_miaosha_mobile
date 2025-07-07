export const label = reactive({
	name: '菜单名称',
	path: '菜单路径',
	title: '菜单标题',
	component: '组件',
	redirect: '跳转',
	icon: '菜单图标',
	hideInMenu: '是否隐藏菜单',
	parentId: '父级机构id',
	summary: '备注',
	status: '状态',
	orderBy: '排序',
});

export const rulesRef = reactive({
	name: [
		{
			required: true,
			message: label.name + '不能为空！',
		},
	],
	path: [
		{
			required: true,
			message: label.path + '不能为空！',
		},
	],
	title: [
		{
			required: true,
			message: label.title + '不能为空！',
		},
	],
	component: [
		{
			required: true,
			message: label.component + '不能为空！',
		},
	],
	redirect: [
		{
			required: true,
			message: label.redirect + '不能为空！',
		},
	],
	icon: [
		{
			required: true,
			message: label.icon + '不能为空！',
		},
	],
	hideInMenu: [
		{
			required: true,
			message: label.hideInMenu + '不能为空！',
		},
	],
	parentId: [
		{
			required: true,
			message: label.parentId + '不能为空！',
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
	orderBy: [
		{
			required: true,
			message: label.orderBy + '不能为空！',
		},
	],
});
