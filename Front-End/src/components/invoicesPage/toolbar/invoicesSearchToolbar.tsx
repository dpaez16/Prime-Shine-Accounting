import React from 'react';
import useLocalization from '@/hooks/useLocalization';
import { WaveInvoiceFilterKey, WaveInvoiceFilterObj } from './useInvoicesSearch';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SelectWaveCustomer } from '@/components/ui/selectors/select-wave-customer';
import { SelectWaveInvoiceStatus, WaveInvoiceStatus } from '@/components/ui/selectors/select-wave-invoice-status';

interface InvoicesSearchToolbarProps {
    onSubmit: () => void;
    handleFilterChange: <K extends WaveInvoiceFilterKey>(key: K, value: WaveInvoiceFilterObj[K]) => void;
    loading: boolean;
    searchParams: WaveInvoiceFilterObj;
}

export const InvoicesSearchToolbar: React.FC<InvoicesSearchToolbarProps> = (props) => {
    const { t } = useLocalization();

    return (
        <div className='flex flex-col lg:flex-row gap-4 my-4'>
            <div className='max-w-fit'>
                <SelectWaveCustomer
                    placeholder={t('All customers')}
                    onChange={(newValue) => props.handleFilterChange('customerId', newValue ?? null)}
                    customerID={props.searchParams.customerId ?? undefined}
                    isClearable
                />
            </div>
            <div className='max-w-fit'>
                <SelectWaveInvoiceStatus
                    placeholder={t('All statuses')!}
                    onChange={(newValue) => props.handleFilterChange('status', newValue ?? null)}
                    status={(props.searchParams.status as WaveInvoiceStatus) ?? undefined}
                    isClearable
                />
            </div>
            <DatePicker
                placeholder='From'
                value={props.searchParams.invoiceDateStart ? new Date(props.searchParams.invoiceDateStart) : undefined}
                onChange={(newValue) => props.handleFilterChange('invoiceDateStart', newValue?.toUTCString() ?? null)}
            />
            <DatePicker
                placeholder='To'
                value={props.searchParams.invoiceDateEnd ? new Date(props.searchParams.invoiceDateEnd) : undefined}
                onChange={(newValue) => props.handleFilterChange('invoiceDateEnd', newValue?.toUTCString() ?? null)}
            />
            <Input
                className='max-w-[200px]'
                placeholder={t('Invoice #')}
                value={props.searchParams.invoiceNumber ?? undefined}
                onChange={(e) => props.handleFilterChange('invoiceNumber', e.target.value)}
            />
            <Button
                disabled={props.loading}
                onClick={(e) => {
                    e.preventDefault();
                    props.onSubmit();
                }}
            >
                {t('Search')}
            </Button>
        </div>
    );
};
