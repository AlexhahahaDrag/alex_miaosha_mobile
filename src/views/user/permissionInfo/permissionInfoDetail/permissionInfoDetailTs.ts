export const label = reactive({
	permissionCode: '权限编码',
	permissionName: '权限名称',
	summary: '描述',
	status: '状态',
	options: 'url',
});

export const rulesRef = reactive({
	permissionCode: [
		{
			required: true,
			message: label.permissionCode + '不能为空！',
		},
	],
	permissionName: [
		{
			required: true,
			message: label.permissionName + '不能为空！',
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
	options: [
		{
			required: true,
			message: label.options + '不能为空！',
		},
	],
});
