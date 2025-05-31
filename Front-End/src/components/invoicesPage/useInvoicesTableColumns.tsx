import { WaveInvoice } from '@/types/waveInvoice';
import { generateGenericTextColumn } from '@/components/ui/data-table/data-table-column-utils';
import useLocalization from '@/hooks/useLocalization';
import { constructDate, dateToStr } from '@/utils/helpers';
import { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';

interface UseInvoicesTableColumns {
    onEditClick: (invoice: WaveInvoice) => void;
    onDeleteClick: (invoice: WaveInvoice) => void;
}

export const useInvoicesTableColumns = (props: UseInvoicesTableColumns) => {
    const { t } = useLocalization();

    const actionsColumn: ColumnDef<WaveInvoice> = {
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
                        <DropdownMenuItem asChild>
                            <span onClick={() => window.open(invoice.pdfUrl, '_blank')}>
                                {t('Download PDF')}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <span onClick={() => window.open(invoice.viewUrl, '_blank')}>
                                {t('View Invoice to Print')}
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    };

    return [
        generateGenericTextColumn<WaveInvoice>({
            id: 'status',
            accessorKey: 'status',
            columnHeader: t('Status'),
            enableSorting: true,
        }),
        generateGenericTextColumn<WaveInvoice>({
            id: 'invoiceDate',
            accessorKey: 'invoiceDate',
            columnHeader: t('Date'),
            textFormatterFunc: (text) => dateToStr(constructDate(text)),
            enableSorting: true,
        }),
        generateGenericTextColumn<WaveInvoice>({
            id: 'invoiceNumber',
            accessorKey: 'invoiceNumber',
            columnHeader: t('Number'),
            enableSorting: true,
        }),
        generateGenericTextColumn<WaveInvoice>({
            id: 'customer',
            accessorKey: 'customer.name',
            columnHeader: t('Customer'),
            enableSorting: true,
        }),
        generateGenericTextColumn<WaveInvoice>({
            id: 'total',
            accessorKey: 'total.value',
            columnHeader: t('Total'),
            enableSorting: true,
            textFormatterFunc: (text) => '$' + text,
        }),
        generateGenericTextColumn<WaveInvoice>({
            id: 'amountDue',
            accessorKey: 'amountDue.value',
            columnHeader: t('Amount Due'),
            enableSorting: true,
            textFormatterFunc: (text) => '$' + text,
        }),
        actionsColumn,
    ];
};