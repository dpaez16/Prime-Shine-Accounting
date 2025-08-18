import React, { useState } from 'react';
import { AdvancedSelect, renderSingleSelectOption } from '../advanced-select';
import { textQueryObjects } from '@/lib/textQueryObjects';
import { WaveInvoicePaymentMethod } from '@/types/waveInvoicePayment';
import { parseWavePaymentMethod } from '@/utils/helpers';

const ALL_WAVE_INVOICE_PAYMENT_METHODS = Object.values(WaveInvoicePaymentMethod);

const usePickerLogic = (selectedPaymentMethod?: WaveInvoicePaymentMethod) => {
    const [filterText, setFilterText] = useState<string>('');

    return {
        paymentMethods: textQueryObjects(filterText, ALL_WAVE_INVOICE_PAYMENT_METHODS, parseWavePaymentMethod),
        filterText,
        setFilterText,
        selectedPaymentMethod: ALL_WAVE_INVOICE_PAYMENT_METHODS.find(paymentMethod => paymentMethod === selectedPaymentMethod),
    };
};

interface SelectWaveInvoicePaymentProps {
    paymentMethod?: WaveInvoicePaymentMethod;
    placeholder?: string;
    onChange: (newPaymentMethod?: WaveInvoicePaymentMethod) => void;
    isClearable?: boolean;
}

export const SelectWaveInvoicePaymentMethod: React.FC<SelectWaveInvoicePaymentProps> = (props) => {
    const { paymentMethods, filterText, setFilterText, selectedPaymentMethod } = usePickerLogic(props.paymentMethod);

    const renderPaymentMethod = (paymentMethod: WaveInvoicePaymentMethod) => {
        return renderSingleSelectOption(
            paymentMethod,
            parseWavePaymentMethod(paymentMethod),
            selectedPaymentMethod !== undefined && selectedPaymentMethod === paymentMethod,
            () => props.onChange(paymentMethod),
        );
    };

    return (
        <AdvancedSelect
            text={selectedPaymentMethod ? parseWavePaymentMethod(selectedPaymentMethod) : undefined}
            placeholder={props.placeholder}
            clearSelection={() => props.onChange(undefined)}
            filterText={filterText}
            setFilterText={setFilterText}
            isClearable={props.isClearable}
        >
            {paymentMethods.map(renderPaymentMethod)}
        </AdvancedSelect>
    );
};