// 定义类型接口
export interface CardItem {
	name: string;
	balance: string;
	bgColor: string;
	id?: string | number;
	cardName?: string;
	cardType?: string;
	status?: string;
}

export interface TransactionItem {
	name: string;
	time: string;
	amount: string;
	formattedAmount: string;
	cardColor: string;
	id?: string | number;
	transactionType?: string;
	description?: string;
	createTime?: string;
}
