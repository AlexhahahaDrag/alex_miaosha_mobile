export interface CategoryItem {
	name: string;
	icon: string;
	color: string;
	bgColor: string;
}

export const expensePresets: CategoryItem[] = [
	{ name: '餐饮', icon: 'food-o', color: '#fa8c16', bgColor: '#fff7e6' },
	{ name: '交通', icon: 'logistics', color: '#1890ff', bgColor: '#e6f7ff' },
	{ name: '购物', icon: 'bag-o', color: '#eb2f96', bgColor: '#fff0f6' },
	{ name: '日用', icon: 'cart-o', color: '#52c41a', bgColor: '#f6ffed' },
	{ name: '娱乐', icon: 'smile-o', color: '#722ed1', bgColor: '#f9f0ff' },
	{ name: '医疗', icon: 'plus', color: '#ff4d4f', bgColor: '#fff1f0' },
	{ name: '住房', icon: 'home-o', color: '#13c2c2', bgColor: '#e6fffb' },
	{ name: '通信', icon: 'phone-o', color: '#2f54eb', bgColor: '#f0f5ff' },
	{ name: '服饰', icon: 'gift-o', color: '#fa541c', bgColor: '#fff2e8' },
	{ name: '零食', icon: 'shop-o', color: '#faad14', bgColor: '#fffbe6' },
	{ name: '学习', icon: 'notes-o', color: '#096dd9', bgColor: '#e6f7ff' },
	{ name: '其它', icon: 'ellipsis', color: '#8c8c8c', bgColor: '#f5f5f5' },
];

export const incomePresets: CategoryItem[] = [
	{ name: '工资', icon: 'gold-coin-o', color: '#52c41a', bgColor: '#f6ffed' },
	{ name: '兼职', icon: 'cash-back-record', color: '#fa8c16', bgColor: '#fff7e6' },
	{ name: '理财', icon: 'chart-trending-o', color: '#1890ff', bgColor: '#e6f7ff' },
	{ name: '礼金', icon: 'gem-o', color: '#ff4d4f', bgColor: '#fff1f0' },
	{ name: '退款', icon: 'refund-o', color: '#13c2c2', bgColor: '#e6fffb' },
	{ name: '其它', icon: 'ellipsis', color: '#8c8c8c', bgColor: '#f5f5f5' },
];
