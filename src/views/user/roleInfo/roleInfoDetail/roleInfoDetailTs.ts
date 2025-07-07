export const label = reactive({
	roleCode: '角色编码',
	roleName: '角色名称',
	summary: '描述',
	status: '状态',
});

export const rulesRef = reactive({
	roleCode: [
		{
			required: true,
			message: label.roleCode + '不能为空！',
		},
	],
	roleName: [
		{
			required: true,
			message: label.roleName + '不能为空！',
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
