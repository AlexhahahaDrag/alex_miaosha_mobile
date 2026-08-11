export const label = reactive({
	roleId: '所属角色',
	userId: '所属用户',
	summary: '描述',
	status: '状态',
});

export const rulesRef = reactive({
	roleId: [
		{
			required: true,
			message: `${label.roleId}不能为空！`,
		},
	],
	userId: [
		{
			required: true,
			message: `${label.userId}不能为空！`,
		},
	],
	summary: [
		{
			required: true,
			message: `${label.summary}不能为空！`,
		},
	],
	status: [
		{
			required: true,
			message: `${label.status}不能为空！`,
		},
	],
});
