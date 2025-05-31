export type WaveInvoicePayment = {
    id: string;
    amount: string;
    exchange_rate: number; // 1
    memo: string;
    payment_account: {
        id: number;
        name: string;
    },
    payment_date: string; // YYYY-MM-DD
    payment_method: string; // 'cash' | 'cheque'
};

export type WaveInvoicePaymentID = WaveInvoicePayment['id'];
