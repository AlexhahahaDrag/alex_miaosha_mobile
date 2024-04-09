export const label = reactive({
    saleOrderCode: '订单编码',
    saleOrderName: '订单名称',
    saleAmount: '总销售金额',
    isValid: '状态',
    saleDate: '销售日期',
    description: '描述',
    payWay: '支付方式',
    saleCount: '销售数量',
});

export const rulesRef = reactive({
    saleOrderCode: [
        {
            required: true,
            message: label.saleOrderCode + '不能为空！',
        },
    ],
    saleOrderName: [
        {
            required: true,
            message: label.saleOrderName + '不能为空！',
        },
    ],
    saleAmount: [
        {
            required: true,
            message: label.saleAmount + '不能为空！',
        },
        { pattern: /^\d+(\.\d+)?$/, message: `请输入正确的总销售金额` }
    ],
    isValid: [
        {
            required: true,
            message: label.isValid + '不能为空！',
        },
    ],
    saleDate: [
        {
            required: true,
            message: label.saleDate + '不能为空！',
        },
    ],
    description: [
        {
            required: true,
            message: label.description + '不能为空！',
        },
    ],
    payWay: [
        {
            required: true,
            message: label.payWay + '不能为空！',
        },
    ],
    saleCount: [
        {
            required: true,
            message: label.saleCount + '不能为空！',
        },
        { pattern: /^\d+(\.\d+)?$/, message: `请输入正确的销售数量` }
    ],
});