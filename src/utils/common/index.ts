import { Decimal } from 'decimal.js';

// 加
const plus = (x: number | string, y: number | string) => {
    if (!x) {
        x = 0
    }
    if (!y) {
        y = 0
    }
    const xx = new Decimal(x)
    const yy = new Decimal(y)
    return xx.plus(yy).toNumber()
}

// 减
const minus = (x: number | string, y: number | string) => {
    if (!x) {
        x = 0
    }
    if (!y) {
        y = 0
    }
    const xx = new Decimal(x)
    const yy = new Decimal(y)
    return xx.minus(yy).toNumber()
}

// 乘
const multiply = (x: number | string, y: number | string) => {
    if (!x) {
        x = 0
    }
    if (!y) {
        y = 0
    }
    const xx = new Decimal(x)
    const yy = new Decimal(y)
    return xx.mul(yy).toNumber()
}

// 除
const divide = (x: number | string, y: number | string) => {
    if (!x) {
        x = 0
    }
    if (!y) {
        y = 0
    }
    const xx = new Decimal(x)
    const yy = new Decimal(y)
    return xx.div(yy).toNumber()
}

const formatAmount = (amount: number | Decimal, digit: number, unit: string) => {
    if (amount == null || amount == undefined) {
        return '--';
    }
    return String(amount.toFixed(digit)).replace(/(?<!\.\d*)\B(?=(\d{3})+(?!\d)) /g, ','
    ).replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') + unit;
}

const getListName = (list: any[], value: any, code: string, name: string) => {
    if (!list?.length) {
        return '';
    }
    let listName = '';
    list.forEach(item => {
        if (item[code] == value) {
            listName = item[name];
        }
    });
    return listName;
};

export default {
    formatAmount: formatAmount,
    plus: plus,
    minus: minus,
    multiply: multiply,
    divide: divide,
    getListName:getListName,
}

