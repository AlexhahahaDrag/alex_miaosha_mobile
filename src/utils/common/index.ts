const formatAmount = (amount: number, digit: number, unit: string) => {
    if (amount == null || amount == undefined) {
        return '--';
    }
    return String(amount.toFixed(digit)).replace(/(?<!\.\d*)\B(?=(\d{3})+(?!\d)) /g, ','
    ).replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') + unit;
}

export default {
    formatAmount: formatAmount,
}