import React, { useContext, useEffect, useRef } from 'react';
import { EventListenerNames } from '@/utils/consts';
import useLocalization from '@/hooks/useLocalization';
import { WaveCustomer } from '@/types/waveCustomer';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { WaveAPIClient } from '@/api/waveApiClient';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { PageTitle } from '@/components/ui/page-title';
import { ErrorMessage } from '@/components/ui/error-message';
import { DataTable, DataTableHandle } from '@/components/ui/data-table/data-table';
import { useCustomersTableColumns } from './customersTable/useCustomersTableColumns';
import { CustomersTableToolbar } from './customersTable/customersTableToolbar';
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination';

export const CustomersPage: React.FC = () => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;
    const businessInfo = context.businessInfo!;

    const { data, loading, error, refetch } = useDataFetcher({ fetcher: () => WaveAPIClient.fetchAllCustomers(businessInfo.businessId, userInfo.token) });
    const dataTableRef = useRef<DataTableHandle<WaveCustomer>>(null);
    const columns = useCustomersTableColumns();
    const { t } = useLocalization();

    useEffect(() => {
        const refetchData = () => refetch();
        window.addEventListener(EventListenerNames.mutateCustomers, refetchData);

        return () => {
            window.removeEventListener(EventListenerNames.mutateCustomers, refetchData);
        };
    }, []);

    const customers = data ?? [];

    return (
        <div className='flex flex-col mx-auto w-1/2'>
            <PageTitle>{t('Customers')}</PageTitle>
            <ErrorMessage message={error?.message} />
            <DataTable
                data={customers}
                columns={columns}
                loading={loading}
                toolbar={CustomersTableToolbar}
                ref={dataTableRef}
                pagination={DataTablePagination}
            />
        </div>
    );
};