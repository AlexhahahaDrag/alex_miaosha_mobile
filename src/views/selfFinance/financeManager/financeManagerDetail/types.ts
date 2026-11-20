export interface CategoryItem {
	name: string;
	icon: string;
	color: string;
	bgColor: string;
	emoji?: string;
}

// Tailwind Soft UI 10% 柔和透明底调色板（对齐 PC 记账流水黄金标杆）
export const softPillPalette = [
	{ color: '#d97706', bgColor: 'rgba(245, 158, 11, 0.12)' }, // Amber
	{ color: '#0284c7', bgColor: 'rgba(14, 165, 233, 0.12)' }, // Sky
	{ color: '#059669', bgColor: 'rgba(16, 185, 129, 0.12)' }, // Emerald
	{ color: '#e11d48', bgColor: 'rgba(244, 63, 94, 0.12)' }, // Rose
	{ color: '#7c3aed', bgColor: 'rgba(139, 92, 246, 0.12)' }, // Violet
	{ color: '#4f46e5', bgColor: 'rgba(79, 70, 229, 0.12)' }, // Indigo
	{ color: '#0891b2', bgColor: 'rgba(6, 182, 212, 0.12)' }, // Cyan
	{ color: '#c026d3', bgColor: 'rgba(217, 70, 239, 0.12)' }, // Fuchsia
];

export const categoryEmojiMap: Record<string, { emoji: string; icon: string }> = {
	餐饮: { emoji: '🍱', icon: 'food-o' },
	美食: { emoji: '🍲', icon: 'food-o' },
	饭: { emoji: '🍚', icon: 'food-o' },
	外卖: { emoji: '🥡', icon: 'shop-o' },
	零食: { emoji: '🍿', icon: 'shop-o' },
	菜: { emoji: '🥦', icon: 'bag-o' },
	买菜: { emoji: '🥬', icon: 'cart-o' },
	水果: { emoji: '🍎', icon: 'shop-o' },
	饮品: { emoji: '☕', icon: 'coffee-o' },
	咖啡: { emoji: '☕', icon: 'coffee-o' },
	奶茶: { emoji: '🧋', icon: 'coffee-o' },
	交通: { emoji: '🚗', icon: 'logistics' },
	出行: { emoji: '🚕', icon: 'logistics' },
	打车: { emoji: '🚕', icon: 'logistics' },
	地铁: { emoji: '🚇', icon: 'logistics' },
	公交: { emoji: '🚌', icon: 'logistics' },
	加油: { emoji: '⛽', icon: 'logistics' },
	购物: { emoji: '🛍️', icon: 'bag-o' },
	日用: { emoji: '🧻', icon: 'cart-o' },
	杂物: { emoji: '📦', icon: 'cart-o' },
	娱乐: { emoji: '🎮', icon: 'smile-o' },
	电影: { emoji: '🎬', icon: 'play-circle-o' },
	医疗: { emoji: '💊', icon: 'plus' },
	看病: { emoji: '🏥', icon: 'plus' },
	住房: { emoji: '🏠', icon: 'home-o' },
	房租: { emoji: '🏠', icon: 'home-o' },
	房贷: { emoji: '🏦', icon: 'balance-o' },
	贷款: { emoji: '💳', icon: 'credit-pay' },
	通信: { emoji: '📱', icon: 'phone-o' },
	话费: { emoji: '📱', icon: 'phone-o' },
	网费: { emoji: '🌐', icon: 'service-o' },
	水费: { emoji: '💧', icon: 'filter-o' },
	水: { emoji: '💧', icon: 'filter-o' },
	电费: { emoji: '⚡', icon: 'bulb-o' },
	燃气费: { emoji: '🔥', icon: 'fire-o' },
	取暖费: { emoji: '♨️', icon: 'fire-o' },
	生活缴费: { emoji: '🧾', icon: 'records-o' },
	物业: { emoji: '🏘️', icon: 'home-o' },
	服饰: { emoji: '👔', icon: 'gift-o' },
	衣服: { emoji: '👗', icon: 'gift-o' },
	剪发: { emoji: '💇', icon: 'smile-o' },
	理发: { emoji: '💇', icon: 'smile-o' },
	美发: { emoji: '💇', icon: 'smile-o' },
	美容: { emoji: '💄', icon: 'gem-o' },
	学习: { emoji: '📚', icon: 'notes-o' },
	书籍: { emoji: '📖', icon: 'notes-o' },
	公司: { emoji: '🏢', icon: 'hotel-o' },
	办公: { emoji: '🏢', icon: 'hotel-o' },
	电脑: { emoji: '💻', icon: 'desktop-o' },
	耳机: { emoji: '🎧', icon: 'music-o' },
	数码: { emoji: '📱', icon: 'desktop-o' },
	红包: { emoji: '🧧', icon: 'gem-o' },
	赶礼: { emoji: '🎁', icon: 'gift-o' },
	礼金: { emoji: '🎁', icon: 'gift-o' },
	零花: { emoji: '🪙', icon: 'gold-coin-o' },
	健身: { emoji: '🏋️', icon: 'smile-o' },
	运动: { emoji: '🏃', icon: 'smile-o' },
	宠物: { emoji: '🐾', icon: 'flower-o' },
	旅行: { emoji: '✈️', icon: 'send-gift-o' },
	工资: { emoji: '💰', icon: 'gold-coin-o' },
	奖金: { emoji: '🧧', icon: 'gold-coin-o' },
	年金: { emoji: '📈', icon: 'chart-trending-o' },
	兼职: { emoji: '💼', icon: 'cash-back-record' },
	理财: { emoji: '📈', icon: 'chart-trending-o' },
	投资: { emoji: '📊', icon: 'chart-trending-o' },
	退款: { emoji: '↩️', icon: 'refund-o' },
	其它: { emoji: '🏷️', icon: 'ellipsis' },
};

export const getCategoryVisualItem = (name?: string, isIncome = false): CategoryItem => {
	const catName = (name || '').trim();
	if (!catName) {
		return {
			name: '其它',
			icon: 'ellipsis',
			emoji: '🏷️',
			color: '#64748b',
			bgColor: 'rgba(100, 116, 139, 0.12)',
		};
	}

	// 1. 精确匹配或子串匹配 Emoji / Icon
	let matched = categoryEmojiMap[catName];
	if (!matched) {
		for (const [key, val] of Object.entries(categoryEmojiMap)) {
			if (catName.includes(key)) {
				matched = val;
				break;
			}
		}
	}
	const emoji = matched?.emoji || (isIncome ? '💰' : '🏷️');
	const icon = matched?.icon || (isIncome ? 'gold-coin-o' : 'apps-o');

	// 2. 颜色根据哈希映射到 Soft UI 调色板
	let hash = 0;
	for (let i = 0; i < catName.length; i++) {
		hash = (hash << 5) - hash + (catName.codePointAt(i) ?? 0);
		hash = Math.trunc(hash);
	}
	const colorConfig = softPillPalette[Math.abs(hash) % softPillPalette.length];

	return {
		name: catName,
		icon,
		emoji,
		color: colorConfig.color,
		bgColor: colorConfig.bgColor,
	};
};

export const expensePresets: CategoryItem[] = [
	{
		name: '餐饮',
		icon: 'food-o',
		emoji: '🍱',
		color: '#d97706',
		bgColor: 'rgba(245, 158, 11, 0.14)',
	},
	{
		name: '交通',
		icon: 'logistics',
		emoji: '🚗',
		color: '#0284c7',
		bgColor: 'rgba(14, 165, 233, 0.14)',
	},
	{ name: '购物', icon: 'bag-o', emoji: '🛍️', color: '#e11d48', bgColor: 'rgba(244, 63, 94, 0.14)' },
	{
		name: '日用',
		icon: 'cart-o',
		emoji: '🧻',
		color: '#059669',
		bgColor: 'rgba(16, 185, 129, 0.14)',
	},
	{
		name: '娱乐',
		icon: 'smile-o',
		emoji: '🎮',
		color: '#7c3aed',
		bgColor: 'rgba(139, 92, 246, 0.14)',
	},
	{ name: '医疗', icon: 'plus', emoji: '💊', color: '#e11d48', bgColor: 'rgba(244, 63, 94, 0.14)' },
	{
		name: '住房',
		icon: 'home-o',
		emoji: '🏠',
		color: '#0891b2',
		bgColor: 'rgba(6, 182, 212, 0.14)',
	},
	{
		name: '通信',
		icon: 'phone-o',
		emoji: '📱',
		color: '#4f46e5',
		bgColor: 'rgba(79, 70, 229, 0.14)',
	},
	{
		name: '服饰',
		icon: 'gift-o',
		emoji: '👔',
		color: '#d97706',
		bgColor: 'rgba(245, 158, 11, 0.14)',
	},
	{
		name: '零食',
		icon: 'shop-o',
		emoji: '🍿',
		color: '#f59e0b',
		bgColor: 'rgba(245, 158, 11, 0.14)',
	},
	{
		name: '学习',
		icon: 'notes-o',
		emoji: '📚',
		color: '#0284c7',
		bgColor: 'rgba(14, 165, 233, 0.14)',
	},
	{
		name: '其它',
		icon: 'ellipsis',
		emoji: '🏷️',
		color: '#64748b',
		bgColor: 'rgba(100, 116, 139, 0.14)',
	},
];

export const incomePresets: CategoryItem[] = [
	{
		name: '工资',
		icon: 'gold-coin-o',
		emoji: '💰',
		color: '#059669',
		bgColor: 'rgba(16, 185, 129, 0.14)',
	},
	{
		name: '兼职',
		icon: 'cash-back-record',
		emoji: '💼',
		color: '#d97706',
		bgColor: 'rgba(245, 158, 11, 0.14)',
	},
	{
		name: '理财',
		icon: 'chart-trending-o',
		emoji: '📈',
		color: '#0284c7',
		bgColor: 'rgba(14, 165, 233, 0.14)',
	},
	{ name: '礼金', icon: 'gem-o', emoji: '🎁', color: '#e11d48', bgColor: 'rgba(244, 63, 94, 0.14)' },
	{
		name: '退款',
		icon: 'refund-o',
		emoji: '↩️',
		color: '#0891b2',
		bgColor: 'rgba(6, 182, 212, 0.14)',
	},
	{
		name: '其它',
		icon: 'ellipsis',
		emoji: '🏷️',
		color: '#64748b',
		bgColor: 'rgba(100, 116, 139, 0.14)',
	},
];
