import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from 'lucide-react';
import { WaveInvoicePayment, WaveInvoicePaymentMethod } from "@/types/waveInvoicePayment";
import useLocalization from "@/hooks/useLocalization";
import { constructDate, dateToStr, parseWavePaymentMethod } from "@/utils/helpers";
import { cn } from "@/lib/utils";

interface InvoicePaymentsTableProps {
    className?: string;
    loading: boolean;
    data: WaveInvoicePayment[];
    onEditClick: (invoicePayment: WaveInvoicePayment) => void;
    onDeleteClick: (invoicePayment: WaveInvoicePayment) => void;
}

export const InvoicePaymentsTable: React.FC<InvoicePaymentsTableProps> = (props) => {
    const { t } = useLocalization();

    if (props.loading) {
        return <Spinner />;
    }

    const renderPayment = (payment: WaveInvoicePayment) => {
        return (
            <TableRow key={payment.id}>
                <TableCell>{dateToStr(constructDate(payment.payment_date), 'mm/dd/yyyy')}</TableCell>
                <TableCell>{t(parseWavePaymentMethod(payment.payment_method as WaveInvoicePaymentMethod))}</TableCell>
                <TableCell>{'$' + payment.amount.toString()}</TableCell>
                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost'>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem asChild>
                                <span onClick={() => props.onEditClick(payment)}>
                                    {t('Edit')}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <span onClick={() => props.onDeleteClick(payment)}>
                                    {t('Delete')}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <Table className={cn(props.className)}>
            <TableHeader>
                <TableRow>
                    <TableHead>{t('Payment Date')}</TableHead>
                    <TableHead>{t('Payment Method')}</TableHead>
                    <TableHead>{t('Amount')}</TableHead>
                    <TableHead>{t('Options')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {props.data.map(renderPayment)}
            </TableBody>
        </Table>
    );
};
