import React, { useState } from 'react';
import { AdvancedSelect, renderSingleSelectOption } from '../advanced-select';
import { textQueryObjects } from '@/lib/textQueryObjects';

export enum WaveInvoiceStatus {
    Draft = 'Draft',
    Unsent = 'Unsent',
    Sent = 'Sent',
    Viewed = 'Viewed',
    Partial = 'Partial',
    Paid = 'Paid',
    Overpaid = 'Overpaid',
    Overdue = 'Overdue',
};

const ALL_WAVE_INVOICE_STATUSES = Object.values(WaveInvoiceStatus);

const usePickerLogic = (selectedStatus?: WaveInvoiceStatus) => {
    const [filterText, setFilterText] = useState<string>('');

    return {
        statuses: textQueryObjects(filterText, ALL_WAVE_INVOICE_STATUSES, (status) => status),
        filterText,
        setFilterText,
        selectedStatus: ALL_WAVE_INVOICE_STATUSES.find(status => status === selectedStatus),
    };
};

interface SelectWaveInvoiceStatusProps {
    status?: WaveInvoiceStatus;
    placeholder?: string;
    onChange: (newStatus?: WaveInvoiceStatus) => void;
    isClearable?: boolean;
}

export const SelectWaveInvoiceStatus: React.FC<SelectWaveInvoiceStatusProps> = (props) => {
    const { statuses, filterText, setFilterText, selectedStatus } = usePickerLogic(props.status);

    const renderStatus = (status: WaveInvoiceStatus) => {
        return renderSingleSelectOption(
            status,
            status,
            selectedStatus !== undefined && selectedStatus === status,
            () => props.onChange(status),
        );
    };

    return (
        <AdvancedSelect
            text={selectedStatus ?? undefined}
            placeholder={props.placeholder}
            clearSelection={() => props.onChange(undefined)}
            filterText={filterText}
            setFilterText={setFilterText}
            isClearable={props.isClearable}
        >
            {statuses.map(renderStatus)}
        </AdvancedSelect>
    );
};