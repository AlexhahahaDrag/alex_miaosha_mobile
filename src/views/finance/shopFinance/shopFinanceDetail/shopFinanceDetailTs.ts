export const label = reactive({
    shopName: '商品名称',
    shopCode: '商品编码',
    saleAmount: '售价',
    isValid: '是否有效',
    saleDate: '销售日期',
    incomeAndExpenses: '收支类型',
    payWay: '支付方式',
});

export const rulesRef = reactive({
    shopName: [
        {
            required: true,
            message: label.shopName + '不能为空！',
        },
    ],
    shopCode: [
        {
            required: true,
            message: label.shopCode + '不能为空！',
        },
    ],
    saleAmount: [
        {
            required: true,
            message: label.saleAmount + '不能为空！',
        },
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
    payWay: [
        {
            required: true,
            message: label.payWay + '不能为空！',
        },
    ],
    incomeAndExpenses: [
        {
            required: true,
            message: label.incomeAndExpenses + '不能为空！',
        },
    ],
});