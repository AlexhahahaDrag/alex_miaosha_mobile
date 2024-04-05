export const label = reactive({
    shopId: '商品id',
    userId: '人员id',
    customerId: '客户id',
    isValid: '是否有效',
    saleNum: '数量',
});

export const rulesRef = reactive({
    shopId: [
        {
            required: true,
            message: label.shopId + '不能为空！',
        },
    ],
    userId: [
        {
            required: true,
            message: label.userId + '不能为空！',
        },
    ],
    customerId: [
        {
            required: true,
            message: label.customerId + '不能为空！',
        },
    ],
    isValid: [
        {
            required: true,
            message: label.isValid + '不能为空！',
        },
    ],
    saleNum: [
        {
            required: true,
            message: label.saleNum + '不能为空！',
        },
        { pattern: /^\d+(\.\d+)?$/, message: `请输入正确的数量` }
    ],
});