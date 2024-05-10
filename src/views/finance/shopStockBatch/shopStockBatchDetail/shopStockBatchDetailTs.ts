export const label = reactive({
    batchCode: '订单编码',
    batchName: '订单名称',
    isValid: '状态',
    description: '描述',
});

export const rulesRef = reactive({
    batchCode: [
        {
            required: true,
            message: label.batchCode + '不能为空！',
        },
    ],
    batchName: [
        {
            required: true,
            message: label.batchName + '不能为空！',
        },
    ],
    isValid: [
        {
            required: true,
            message: label.isValid + '不能为空！',
        },
    ],
    description: [
        {
            required: true,
            message: label.description + '不能为空！',
        },
    ],
});