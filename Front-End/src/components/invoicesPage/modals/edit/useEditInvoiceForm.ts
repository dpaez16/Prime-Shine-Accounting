import { WaveInvoice, WaveInvoicePatchInput } from '@/types/waveInvoice';
import { useState } from 'react';
import { InvoiceService } from '../invoiceItemsForm';
import { v4 as uuidV4 } from 'uuid';

export const useEditInvoiceForm = (invoice: WaveInvoice) => {
    const [invoiceParams, setInvoiceParams] = useState<WaveInvoicePatchInput>({
        id: invoice.id,
        invoiceDate: invoice.invoiceDate,
        customerId: invoice.customer.id,
        memo: invoice.memo,
        items: [],
    });

    const setInvoiceParam = <K extends keyof WaveInvoicePatchInput>(key: K, value: WaveInvoicePatchInput[K]) => {
        setInvoiceParams({
            ...invoiceParams,
            [key]: value,
        });
    };

    const [invoiceServices, setInvoiceServices] = useState<InvoiceService[]>(invoice.items.map(item => {
        return {
            description: item.description,
            productId: item.product.id,
            quantity: 1,
            unitPrice: item.total.value,
            uuid: uuidV4(),
        };
    }));

    return {
        invoiceParams,
        setInvoiceParam,
        invoiceServices,
        setInvoiceServices,
    };
};