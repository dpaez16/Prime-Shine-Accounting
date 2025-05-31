import React, { useContext, useState } from 'react';
import { AdvancedSelect, renderSingleSelectOption } from '../advanced-select';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { WaveAPIClient } from '@/api/waveApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import useDebounce from '@/hooks/useDebounce';
import { textQueryObjects } from '@/lib/textQueryObjects';
import { WaveCustomer, WaveCustomerID } from '@/types/waveCustomer';

const usePickerLogic = (selectedCustomerID?: WaveCustomerID) => {
    const context = useContext(LoginSessionContext);
    const businessInfo = context.businessInfo!;
    const userInfo = context.userInfo!;

    const { data, loading } = useDataFetcher({ fetcher: () => WaveAPIClient.fetchAllCustomers(businessInfo.businessId, userInfo.token) });
    const customers = data ?? [];

    const [filterText, setFilterText] = useState<string>('');
    const debouncedFilterText = useDebounce<string>(filterText, 100);

    return {
        customers: textQueryObjects(debouncedFilterText, customers, (customer) => customer.name),
        filterText,
        setFilterText,
        loading,
        selectedCustomer: customers.find(customer => customer.id === selectedCustomerID),
    };
};

interface SelectWaveCustomerProps {
    customerID?: WaveCustomerID;
    placeholder?: string;
    onChange: (newCustomer?: WaveCustomerID) => void;
    isClearable?: boolean;
    disabled?: boolean;
}

export const SelectWaveCustomer: React.FC<SelectWaveCustomerProps> = (props) => {
    const { customers, filterText, setFilterText, loading, selectedCustomer } = usePickerLogic(props.customerID);

    const renderCustomer = (customer: WaveCustomer) => {
        return renderSingleSelectOption(
            customer.id,
            customer.name,
            selectedCustomer !== undefined && selectedCustomer.id === customer.id,
            () => props.onChange(customer.id),
        );
    };

    return (
        <AdvancedSelect
            text={selectedCustomer?.name ?? undefined}
            placeholder={props.placeholder}
            clearSelection={() => props.onChange(undefined)}
            filterText={filterText}
            setFilterText={setFilterText}
            isClearable={props.isClearable}
            disabled={props.disabled}
            loading={loading}
        >
            {customers.map(renderCustomer)}
        </AdvancedSelect>
    );
};