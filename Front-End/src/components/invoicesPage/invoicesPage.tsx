import React, { useEffect, useContext, useState } from 'react';
import {
    Divider,
    Pagination,
    Button,
    Message,
    PaginationProps,
} from 'semantic-ui-react';
import { WaveInvoiceFilterKey, WaveInvoiceFilterObj } from '../../api/waveApiClient';
import InvoicesTable from './invoicesTable/invoicesTable';
import { CreateInvoiceModal } from './createInvoiceModal/createInvoiceModal';
import useLocalization from '../../hooks/useLocalization';
import { WaveInvoice } from '@/types/waveInvoice';
import { WavePageInfo } from '@/types/wavePageInfo';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { InvoicesSearchToolbar } from './invoicesSearchToolbar/invoicesSearchToolbar';
import { useInvoicesSearch } from './invoicesSearchToolbar/useInvoicesSearch';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { EventListenerNames } from '@/utils/consts';
import { WaveAPIClient2 } from '@/api/waveApiClient2';

const PAGE_SIZE = 50;

interface InvoicesData {
    invoices: WaveInvoice[];
    pageInfo: WavePageInfo;
}

export default function InvoicesPage() {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;
    const businessInfo = context.businessInfo!;

    const { t } = useLocalization();
    const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
    const { filterParameters, handleFilterChange, pageNum, setPageNum } = useInvoicesSearch();

    const { data, loading, error, refetch } = useDataFetcher<InvoicesData>({ fetcher: () => searchHandler() });

    const invoices = data?.invoices ?? [];

    const searchHandler = () => {
        const businessId = businessInfo.businessId;

        const filterParametersObj = Object.keys(filterParameters).reduce((filtered, key) => {
            const k = key as WaveInvoiceFilterKey;

            if (filterParameters[k] !== '') {
                filtered[k] = filterParameters[k];
            }

            return filtered;
        }, {} as WaveInvoiceFilterObj);

        return WaveAPIClient2.fetchInvoices(businessId, { ...filterParametersObj, page: pageNum, pageSize: PAGE_SIZE, }, userInfo.token);
    };

    const handlePageChange = (
        _: React.MouseEvent<HTMLAnchorElement>,
        data: PaginationProps,
    ) => {
        const activePage = data.activePage as number;
        setPageNum(activePage);
    };

    useEffect(() => {
        const refetchData = () => {
            refetch();
        };

        window.addEventListener(EventListenerNames.mutateInvoice, refetchData);

        return () => {
            window.removeEventListener(EventListenerNames.mutateInvoice, refetchData);
        };
    }, []);

    useEffect(() => {
        refetch();
    }, [pageNum]);

    return (
        <div className='flex flex-col'>
            <h1>{t('Invoices')}</h1>
            {createInvoiceModalOpen && <CreateInvoiceModal
                onClose={() => setCreateInvoiceModalOpen(false)}
            />}
            <div>
                <Button onClick={() => setCreateInvoiceModalOpen(true)}>{t('Create Invoice')}</Button>
            </div>
            <InvoicesSearchToolbar
                onSubmit={refetch}
                handleFilterChange={handleFilterChange}
                loading={loading}
            />
            <Divider hidden />
            {error && <Message negative content={error.message} />}
            {
                !error &&
                <InvoicesTable
                    loading={loading}
                    invoices={invoices}
                />
            }
            {
                data?.pageInfo &&
                <Pagination
                    boundaryRange={0}
                    activePage={pageNum}
                    siblingRange={1}
                    totalPages={data.pageInfo.totalPages}
                    onPageChange={handlePageChange}
                />
            }
        </div>
    );
}
