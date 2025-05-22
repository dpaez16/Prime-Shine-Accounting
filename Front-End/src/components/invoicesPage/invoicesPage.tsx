import React, { useEffect, useContext, useState } from 'react';
import {
    Divider,
    Button,
    Message,
} from 'semantic-ui-react';
import InvoicesTable from './invoicesTable/invoicesTable';
import { CreateInvoiceModal } from './createInvoiceModal/createInvoiceModal';
import useLocalization from '../../hooks/useLocalization';
import { WaveInvoice } from '@/types/waveInvoice';
import { WavePageInfo } from '@/types/wavePageInfo';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { InvoicesSearchToolbar } from './invoicesSearchToolbar/invoicesSearchToolbar';
import { useInvoicesSearch, WaveInvoiceFilterObj } from './invoicesSearchToolbar/useInvoicesSearch';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { EventListenerNames } from '@/utils/consts';
import { WaveAPIClient } from '@/api/waveApiClient';
import { InvoicesPagination } from './invoicesPagination';

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
    const {
        filterParameters,
        handleFilterChange,
        pageNumRef,
        setPageNum,
        pageSizeRef,
        setPageSize,
    } = useInvoicesSearch();

    const { data, loading, error, refetch } = useDataFetcher<InvoicesData>({
        fetcher: () => searchHandler(),
    });

    const invoices = data?.invoices ?? [];

    const searchHandler = () => {
        const businessId = businessInfo.businessId;

        const filterParametersObj = Object.entries(filterParameters)
            .filter(entry => entry[1] !== null)
            .reduce((filtered, entry) => ({ ...filtered, [entry[0]]: entry[1], }), {} as WaveInvoiceFilterObj);

        return WaveAPIClient.fetchInvoices(
            businessId,
            {
                ...filterParametersObj,
                page: pageNumRef.current,
                pageSize: pageSizeRef.current,
            },
            userInfo.token,
        );
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

    return (
        <div className='flex flex-col'>
            <h1>{t('Invoices')}</h1>
            {createInvoiceModalOpen && <CreateInvoiceModal onClose={() => setCreateInvoiceModalOpen(false)} />}
            <div>
                <Button onClick={() => setCreateInvoiceModalOpen(true)}>
                    {t('Create Invoice')}
                </Button>
            </div>
            <InvoicesSearchToolbar
                onSubmit={() => {
                    setPageNum(1);
                    refetch();
                }}
                handleFilterChange={handleFilterChange}
                loading={loading}
            />
            <Divider hidden />
            {error && <Message negative content={error.message} />}
            {
                !error &&
                <>
                    <InvoicesTable
                        loading={loading}
                        invoices={invoices}
                    />
                    <InvoicesPagination
                        currentPageSize={pageSizeRef.current}
                        pageInfo={data?.pageInfo}
                        handlePageChange={newPageNum => {
                            setPageNum(newPageNum);
                            refetch();
                        }}
                        handlePageSizeChange={newPageSize => {
                            setPageSize(newPageSize);
                            refetch();
                        }}
                    />
                </>
            }
        </div>
    );
}
