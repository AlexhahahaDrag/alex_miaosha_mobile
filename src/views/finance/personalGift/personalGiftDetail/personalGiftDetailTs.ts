export const label = reactive({
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
            message: label.eventName + '不能为空！',
        },
    ],
    amount: [
        {
            required: true,
            message: label.amount + '不能为空！',
        },
        { pattern: /^\d+(\.\d+)?$/, message: `请输入正确的金额` }
    ],
    otherPerson: [
        {
            required: true,
            message: label.otherPerson + '不能为空！',
        },
    ],
    eventTime: [
        {
            required: true,
            message: label.eventTime + '不能为空！',
        },
    ],
    action: [
        {
            required: true,
            message: label.action + '不能为空！',
        },
    ],
});