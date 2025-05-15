import WaveAPIClient, { WaveInvoiceFilterKey } from '@/api/waveApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import useLocalization from '@/hooks/useLocalization';
import { fetchAllCustomers } from '@/utils/helpers';
import React, { useContext } from 'react';
import {
    Container,
    Input,
    Dropdown,
    Button,
    InputOnChangeData,
    DropdownProps,
} from 'semantic-ui-react';

interface InvoicesSearchToolbarProps {
    onSubmit: () => void;
    handleFilterChange: (key: WaveInvoiceFilterKey, value: string | null) => void;
    loading: boolean;
}

export const InvoicesSearchToolbar: React.FC<InvoicesSearchToolbarProps> = (props) => {
    const context = useContext(LoginSessionContext);
    const businessInfo = context.businessInfo!;

    const { t } = useLocalization();
    const { data: customers, loading: loadingCustomers } = useDataFetcher({ fetcher: () => fetchAllCustomers(businessInfo.businessId) });

    const handleFilterChange = (
        _: React.ChangeEvent<HTMLInputElement> | React.SyntheticEvent<HTMLElement>,
        data: InputOnChangeData | DropdownProps,
    ) => {
        const name = data.name as WaveInvoiceFilterKey;
        const value = data.value as string | null;

        props.handleFilterChange(name, value);
    };

    const customerOptions = customers?.map(customer => {
        return {
            key: customer.id,
            value: customer.id,
            text: customer.name,
        };
    });

    const invoiceStatusOptions = WaveAPIClient.WAVE_INVOICE_STATUSES.map(waveStatus => {
        return {
            key: waveStatus,
            value: waveStatus.toUpperCase(),
            text: waveStatus,
        };
    });

    return (
        <Container className="InvoicesPage_filters" fluid textAlign="center">
            <Dropdown
                placeholder={t('All customers')!}
                selection
                search
                clearable
                loading={loadingCustomers}
                options={customerOptions ?? []}
                name="customerId"
                onChange={handleFilterChange}
            />
            <Dropdown
                placeholder={t('All statuses')!}
                selection
                clearable
                options={invoiceStatusOptions}
                name="status"
                onChange={handleFilterChange}
            />
            <Input
                type="date"
                placeholder="From"
                name="invoiceDateStart"
                onChange={handleFilterChange}
            />
            <Input
                type="date"
                placeholder="To"
                name="invoiceDateEnd"
                onChange={handleFilterChange}
            />
            <Input
                type="text"
                placeholder={t('Invoice #')}
                name="invoiceNumber"
                onChange={handleFilterChange}
            />
            <Button
                color="green"
                disabled={props.loading}
                onClick={(e) => {
                    e.preventDefault();

                    props.onSubmit();
                }}
            >
                {t('Search')}
            </Button>
        </Container>
    );
};
