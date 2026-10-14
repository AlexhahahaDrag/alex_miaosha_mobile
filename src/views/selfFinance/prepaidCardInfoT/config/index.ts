import ahySvg from '@/assets/images/shop/ahy.svg';
import bytSvg from '@/assets/images/shop/byt.svg';
import mcSvg from '@/assets/images/shop/mc.svg';
import txdSvg from '@/assets/images/shop/txd.svg';
import xwtpSvg from '@/assets/images/shop/xwtp.svg';
import ylSvg from '@/assets/images/shop/yl.svg';
import hllSvg from '@/assets/images/shop/hll.svg';
import glSvg from '@/assets/images/shop/gl.svg';

// 定义类型接口
export interface CardItem {
	name: string;
	balance: string;
	bgColor: string;
	id?: string;
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
	id?: string;
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
	const colors = ['#268CF2', '#CC66E5', '#4DB280', '#FF6B6B', '#FFA726', '#66BB6A'];
	return colors[index % colors.length];
};

export interface PrepaidCardInfoTData {
	[key: string]: unknown;
}
