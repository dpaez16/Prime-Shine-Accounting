import { Button } from "@/components/ui/button";
import { generateGenericTextColumn } from "@/components/ui/data-table/data-table-column-utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useLocalization from "@/hooks/useLocalization";
import { FullScheduledCustomer } from "@/types/scheduledCustomer";
import { constructTimeStr } from "@/utils/helpers";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

interface UseScheduledCustomerTableColumnsProps {
    onEditClick: (scheduledCustomer: FullScheduledCustomer) => void;
    onDeleteClick: (scheduledCustomer: FullScheduledCustomer) => void;
}

export const useScheduledCustomerTableColumns = (props: UseScheduledCustomerTableColumnsProps) => {
    const { t } = useLocalization();

    const actionsColumn: ColumnDef<FullScheduledCustomer> = {
        id: 'actions',
        cell: ({ row }) => {
            const scheduledCustomer = row.original;

            return (
                <div className='flex flex-row justify-end'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost'>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem asChild>
                                <span onClick={() => props.onEditClick(scheduledCustomer)}>
                                    {t('Edit')}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <span onClick={() => props.onDeleteClick(scheduledCustomer)}>
                                    {t('Delete')}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    };

    return [
        generateGenericTextColumn<FullScheduledCustomer>({
            id: 'name',
            accessorKey: 'metadata.name',
            columnHeader: t('Customer'),
            enableSorting: false,
        }),
        generateGenericTextColumn<FullScheduledCustomer>({
            id: 'startTime',
            accessorKey: 'startTime',
            columnHeader: t('Service Start Time'),
            enableSorting: false,
            textFormatterFunc: constructTimeStr,
        }),
        generateGenericTextColumn<FullScheduledCustomer>({
            id: 'endTime',
            accessorKey: 'endTime',
            columnHeader: t('Service End Time'),
            enableSorting: false,
            textFormatterFunc: constructTimeStr,
        }),
        actionsColumn,
    ];
};