import { WaveInvoicePaymentCreateInput, WaveInvoicePaymentMethod } from "@/types/waveInvoicePayment";
import { useState } from "react";

export const useCreateInvoicePaymentForm = () => {
    const [invoicePaymentParams, setInvoicePaymentParams] = useState<WaveInvoicePaymentCreateInput>({
        amount: 0,
        exchange_rate: 1,
        memo: '',
        payment_date: '',
        payment_method: WaveInvoicePaymentMethod.Cash,
        payment_account: {
            id: 1, // TODO: find this
        },
    });

    const setInvoicePaymentParam = <K extends keyof WaveInvoicePaymentCreateInput>(key: K, value: WaveInvoicePaymentCreateInput[K]) => {
        setInvoicePaymentParams({
            ...invoicePaymentParams,
            [key]: value,
        });
    };

    return {
        invoicePaymentParams,
        setInvoicePaymentParam,
    };
};