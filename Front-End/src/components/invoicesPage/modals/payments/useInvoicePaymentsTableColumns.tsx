import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import useLocalization from "@/hooks/useLocalization";
import { WaveInvoicePayment, WaveInvoicePaymentMethod } from "@/types/waveInvoicePayment";
import { ColumnDef } from '@tanstack/react-table';
import { Button } from "@/components/ui/button";
import { generateGenericNumericColumn, generateGenericTextColumn } from "@/components/ui/data-table/data-table-column-utils";
import { constructDate, dateToStr, parseWavePaymentMethod } from "@/utils/helpers";

interface UseInvoicePaymentsTableColumns {
    onEditClick: (invoicePayment: WaveInvoicePayment) => void;
    onDeleteClick: (invoicePayment: WaveInvoicePayment) => void;
}

export const useInvoicePaymentsTableColumns = (props: UseInvoicePaymentsTableColumns) => {
    const { t } = useLocalization();

    const actionsColumn: ColumnDef<WaveInvoicePayment> = {
        id: 'actions',
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title={t('Options')} />
            );
        },
        cell: ({ row }) => {
            const invoice = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost'>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                            <span onClick={() => props.onEditClick(invoice)}>
                                {t('Edit')}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <span onClick={() => props.onDeleteClick(invoice)}>
                                {t('Delete')}
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    };

    return [
        generateGenericTextColumn<WaveInvoicePayment>({
            id: 'paymentDate',
            accessorKey: 'payment_date',
            columnHeader: t('Payment Date'),
            textFormatterFunc: (text) => dateToStr(constructDate(text), 'mm/dd/yyyy'),
            enableSorting: true,
        }),
        generateGenericTextColumn<WaveInvoicePayment>({
            id: 'paymentMethod',
            accessorKey: 'payment_method',
            columnHeader: t('Payment Method'),
            enableSorting: true,
            textFormatterFunc: (text) => t(parseWavePaymentMethod(text as WaveInvoicePaymentMethod)),
        }),
        generateGenericNumericColumn<WaveInvoicePayment>({
            id: 'amount',
            accessorKey: 'amount',
            columnHeader: t('Amount'),
            enableSorting: true,
            numberFormatterFunc: (num) => '$' + num!.toString(),
        }),
        actionsColumn,
    ];
};