import React, { useContext, useEffect, useState } from 'react';
import { CreateInvoiceModal } from './modals/create/createInvoiceModal';
import useLocalization from '@/hooks/useLocalization';
import { WaveInvoice } from '@/types/waveInvoice';
import { WavePageInfo } from '@/types/wavePageInfo';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { InvoicesSearchToolbar } from './toolbar/invoicesSearchToolbar';
import { useInvoicesSearch, WaveInvoiceFilterObj } from './toolbar/useInvoicesSearch';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { WaveAPIClient } from '@/api/waveApiClient';
import { InvoicesPagination } from './invoicesPagination';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useInvoicesTableColumns } from './useInvoicesTableColumns';
import { DeleteInvoiceModal } from './modals/deleteInvoiceModal';
import { EditInvoiceModal } from './modals/edit/editInvoiceModal';
import { InvoicePaymentsModal } from './modals/payments/invoicePaymentsModal';
import { EventListenerNames } from '@/utils/consts';

interface InvoicesData {
    invoices: WaveInvoice[];
    pageInfo: WavePageInfo;
}

export const InvoicesPage: React.FC = () => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;
    const businessInfo = context.businessInfo!;

    const { t } = useLocalization();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editInvoice, setEditInvoice] = useState<WaveInvoice | null>(null);
    const [deleteInvoice, setDeleteInvoice] = useState<WaveInvoice | null>(null);
    const [paymentInvoice, setPaymentInvoice] = useState<WaveInvoice | null>(null);

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
    const columns = useInvoicesTableColumns({
        onEditClick: setEditInvoice,
        onDeleteClick: setDeleteInvoice,
        onPaymentsClick: setPaymentInvoice,
    });

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
        const refetchData = () => refetch();
        window.addEventListener(EventListenerNames.mutateInvoicePayments, refetchData);

        return () => {
            window.removeEventListener(EventListenerNames.mutateInvoicePayments, refetchData);
        };
    }, []);

    return (
        <div className='flex flex-col'>
            <PageTitle>{t('Invoices')}</PageTitle>
            {
                createModalOpen &&
                <CreateInvoiceModal
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={() => {
                        setCreateModalOpen(false);
                        refetch();
                    }}
                />
            }
            {
                editInvoice &&
                <EditInvoiceModal
                    invoice={editInvoice}
                    onClose={() => setEditInvoice(null)}
                    onSuccess={() => {
                        setEditInvoice(null);
                        refetch();
                    }}
                />
            }
            {
                deleteInvoice &&
                <DeleteInvoiceModal
                    invoice={deleteInvoice}
                    onClose={() => setDeleteInvoice(null)}
                    onSuccess={() => {
                        setDeleteInvoice(null);
                        refetch();
                    }}
                />
            }
            {
                paymentInvoice &&
                <InvoicePaymentsModal
                    invoice={paymentInvoice}
                    onClose={() => setPaymentInvoice(null)}
                    onSuccess={() => {
                        setPaymentInvoice(null);
                        refetch();
                    }}
                />
            }
            <div className='flex flex-col gap-2 my-4'>
                <div>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        {t('Create Invoice')}
                    </Button>
                </div>
                <InvoicesSearchToolbar
                    searchParams={filterParameters}
                    onSubmit={() => {
                        setPageNum(1);
                        refetch();
                    }}
                    handleFilterChange={handleFilterChange}
                    loading={loading}
                />
            </div>
            <ErrorMessage message={error?.message} />
            <DataTable
                columns={columns}
                data={invoices}
                loading={loading}
                pagination={() =>
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
                }
                manualPagination
            />
        </div>
    );
};
