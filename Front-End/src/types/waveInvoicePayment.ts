export type WaveInvoicePayment = {
    amount: string,
    exchange_rate: number, // 1
    memo: string;
    payment_account: {
        id: number,
    },
    payment_date: string; // YYYY-MM-DD
    payment_method: string; // 'cash'
};
