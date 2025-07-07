export const label = reactive({
	orgId: '公司角色id',
	userId: '用户id',
	summary: '描述',
	status: '状态',
});

export const rulesRef = reactive({
	orgId: [
		{
			required: true,
			message: label.orgId + '不能为空！',
		},
	],
	userId: [
		{
			required: true,
			message: label.userId + '不能为空！',
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
