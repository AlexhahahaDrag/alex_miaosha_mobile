export const label = reactive({
    orderId: '订单id',
    shopName: '商品名称',
    shopCode: '商品编码',
    saleAmount: '售价',
    isValid: '是否有效',
    saleDate: '销售日期',
    payWay: '支付方式',
    saleNum: '个数',
    shopStockId: '商品库存id',
});

export const rulesRef = reactive({
    orderId: [
        {
            required: true,
            message: label.orderId + '不能为空！',
        },
    ],
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
        { pattern: /^\d+(\.\d+)?$/, message: `请输入正确的售价` }
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
    saleNum: [
        {
            required: true,
            message: label.saleNum + '不能为空！',
        },
        { pattern: /^\d+(\.\d+)?$/, message: `请输入正确的个数` }
    ],
    shopStockId: [
        {
            required: true,
            message: label.shopStockId + '不能为空！',
        },
    ],
});