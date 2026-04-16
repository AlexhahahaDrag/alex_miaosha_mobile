import type { Dayjs } from 'dayjs';

export interface PersonalGiftData {
	id?: string;
	eventName?: string;
	amount?: number;
	otherPerson?: string;
	eventTime?: Dayjs | string;
	remarks?: string;
	action?: number;
	noticeNum?: number;
	actionName?: string;
	eventTimeName?: string;
	keyword?: string;
}

export const labelMap = reactive({
	eventName: '事件名称',
	amount: '金额',
	otherPerson: '其他人',
	eventTime: '随礼时间',
	remarks: '备注',
	action: '动作',
	noticeNum: '通知次数',
});

export const rulesRef = reactive({
	eventName: [
		{
			required: true,
			message: `${labelMap.eventName}不能为空！`,
		},
	],
	amount: [
		{
			required: true,
			message: `${labelMap.amount}不能为空！`,
		},
		{ pattern: /^\d+(\.\d+)?$/, message: '请输入正确的金额' },
	],
	otherPerson: [
		{
			required: true,
			message: `${labelMap.otherPerson}不能为空！`,
		},
	],
	eventTime: [
		{
			required: true,
			message: `${labelMap.eventTime}不能为空！`,
		},
	],
	action: [
		{
			required: true,
			message: `${labelMap.action}不能为空！`,
		},
	],
});
