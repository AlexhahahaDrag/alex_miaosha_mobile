import ahySvg from '@/assets/icons/shop/ahy.svg';
import bytSvg from '@/assets/icons/shop/byt.svg';
import mcSvg from '@/assets/icons/shop/mc.svg';
import txdSvg from '@/assets/icons/shop/txd.svg';
import xwtpSvg from '@/assets/icons/shop/xwtp.svg';
import ylSvg from '@/assets/icons/shop/yl.svg';
import hllSvg from '@/assets/icons/shop/hll.svg';
import glSvg from '@/assets/icons/shop/gl.svg';

// 定义类型接口
export interface CardItem {
	name: string;
	balance: string;
	bgColor: string;
	id?: string | number;
	cardName?: string;
	cardType?: string;
	status?: string;
	currentBalance?: number | string;
}

export interface TransactionItem {
	name: string;
	time: string;
	amount: string;
	formattedAmount: string;
	cardColor: string;
	indicatorBg?: string;
	id?: string | number;
	transactionType?: string;
	description?: string;
	createTime?: string;
}

export const typeIconMap = {
	比优特w: bytSvg,
	一栗: ylSvg,
	'A+会员': ahySvg,
	好利来: hllSvg,
	寻味唐派: xwtpSvg,
	锅烙: glSvg,
	淘鲜达: txdSvg,
	猫超b: mcSvg,
	比优特mj: bytSvg,
};

// 根据索引获取卡片颜色
export const getCardColor = (index: number) => {
	const colors = [
		'#268CF2',
		'#CC66E5',
		'#4DB280',
		'#FF6B6B',
		'#FFA726',
		'#66BB6A',
	];
	return colors[index % colors.length];
};
