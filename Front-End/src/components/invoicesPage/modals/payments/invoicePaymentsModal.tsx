import React, { useContext, useState } from "react";
import { LoginSessionContext } from "@/context/LoginSessionContext";
import { WaveInvoice } from "@/types/waveInvoice";
import useLocalization from "@/hooks/useLocalization";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GridForm, GridFormItem } from "@/components/ui/grid-form";
import { useDataFetcher } from "@/hooks/useDataFetcher";
import { WaveAPIClient } from "@/api/waveApiClient";
import { WaveInvoicePayment } from "@/types/waveInvoicePayment";
import { ErrorMessage } from "@/components/ui/error-message";
import { constructDate, dateToStr } from "@/utils/helpers";
import { EditInvoicePaymentModal } from "./edit/editInvoicePaymentModal";
import { Button } from "@/components/ui/button";
import { DeleteInvoicePaymentModal } from "./deleteInvoicePaymentModal";
import { CreateInvoicePaymentModal } from "./create/createInvoicePaymentModal";
import { InvoicePaymentsTable } from "./payments-table/invoicePaymentsTable";

type InvoicePaymentsModalProps = {
    invoice: WaveInvoice;
    onSuccess: () => void;
    onClose: () => void;
};

export const InvoicePaymentsModal: React.FC<InvoicePaymentsModalProps> = (props) => {
    const loginSession = useContext(LoginSessionContext);
    const userInfo = loginSession.userInfo!;
    const businessInfo = loginSession.businessInfo!;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editInvoicePayment, setEditInvoicePayment] = useState<WaveInvoicePayment | null>(null);
    const [deleteInvoicePayment, setDeleteInvoicePayment] = useState<WaveInvoicePayment | null>(null);

    const { t } = useLocalization();
    const { invoice } = props;

    const { data, loading, error, refetch } = useDataFetcher<WaveInvoicePayment[]>({
        fetcher: () => WaveAPIClient.fetchInvoicePayments(businessInfo.identityBusinessID, invoice.internalId, userInfo.token),
    });

    const invoicePayments = data ?? [];
    const paymentsSum = invoicePayments
        .map(invoicePayment => parseFloat(invoicePayment.amount.toString()))
        .reduce((acc, curr) => acc + curr, 0);

    return (
        <Dialog open={true} onOpenChange={isOpen => !isOpen && props.onClose()}>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('Invoice Payments')}</DialogTitle>
                </DialogHeader>
                <GridForm>
                    <GridFormItem label={t('Invoice Number')}>
                        <span>{invoice.invoiceNumber}</span>
                    </GridFormItem>
                    <GridFormItem label={t('Customer')}>
                        <span>{invoice.customer.name}</span>
                    </GridFormItem>
                    <GridFormItem label={t('Date of Service')}>
                        <span>{dateToStr(constructDate(invoice.invoiceDate), 'mm/dd/yyyy')}</span>
                    </GridFormItem>
                </GridForm>
                <ErrorMessage message={error?.message} />
                <InvoicePaymentsTable
                    className='w-full'
                    data={invoicePayments}
                    loading={loading}
                    onEditClick={setEditInvoicePayment}
                    onDeleteClick={setDeleteInvoicePayment}
                />
                <DialogFooter>
                    {
                        invoicePayments.length > 0 &&
                        <div className='my-auto mr-2'>{t('Total')}: {'$' + paymentsSum}</div>
                    }
                    <Button
                        onClick={() => setCreateModalOpen(true)}
                    >
                        {t('Record Payment')}
                    </Button>
                </DialogFooter>
            </DialogContent>
            {
                createModalOpen &&
                <CreateInvoicePaymentModal
                    internalInvoiceID={invoice.internalId}
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={() => {
                        setCreateModalOpen(false);
                        refetch();
                    }}
                />
            }
            {
                editInvoicePayment &&
                <EditInvoicePaymentModal
                    internalInvoiceID={invoice.internalId}
                    invoicePayment={editInvoicePayment}
                    onClose={() => setEditInvoicePayment(null)}
                    onSuccess={() => {
                        setEditInvoicePayment(null);
                        refetch();
                    }}
                />
            }
            {
                deleteInvoicePayment &&
                <DeleteInvoicePaymentModal
                    internalInvoiceID={invoice.internalId}
                    invoicePayment={deleteInvoicePayment}
                    onClose={() => setDeleteInvoicePayment(null)}
                    onSuccess={() => {
                        setDeleteInvoicePayment(null);
                        refetch();
                    }}
                />
            }
        </Dialog>
    );
};
