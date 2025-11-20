import { Prettify } from './prettify';

export enum WaveInvoicePaymentMethod {
    Cash = 'cash',
    Check = 'cheque',
    BankPayment = 'bank_payment',
    CreditCard = 'credit_card',
    PayPal = 'paypal',
    Other = 'other',
};

export type WaveInvoicePayment = {
    id: string;
    amount: number | string;
    exchange_rate: number; // 1
    memo: string;
    payment_account: {
        id: number;
        name: string;
    },
    payment_date: string; // YYYY-MM-DD
    payment_method: WaveInvoicePaymentMethod;
};

export type WaveInvoicePaymentID = WaveInvoicePayment['id'];

export type WaveInvoicePaymentCreateInput = Prettify<
    Omit<WaveInvoicePayment, 'id' | 'payment_account'> &
    {
        payment_account: {
            id: WaveInvoicePayment['payment_account']['id'];
        },
    }
>;
