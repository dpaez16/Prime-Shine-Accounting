import { WaveInvoicePayment } from "@/types/waveInvoicePayment";
import { useState } from "react";

export const useEditInvoicePaymentForm = (invoicePayment: WaveInvoicePayment) => {
    const [invoicePaymentParams, setInvoicePaymentParams] = useState<WaveInvoicePayment>({ ...invoicePayment });

    const setInvoicePaymentParam = <K extends keyof WaveInvoicePayment>(key: K, value: WaveInvoicePayment[K]) => {
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