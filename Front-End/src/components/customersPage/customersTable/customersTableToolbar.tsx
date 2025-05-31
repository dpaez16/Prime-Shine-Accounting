import { WaveCustomer } from '@/types/waveCustomer';
import { DataTableToolbarProps } from '@/components/ui/data-table/data-table';
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar';
import { DataTableColumnFilter } from '@/components/ui/data-table/data-table-column-filter';
import { EventListenerNames } from '@/utils/consts';
import { CreateCustomerModal } from './modals/createCustomerModal';

export const CustomersTableToolbar = (props: DataTableToolbarProps<WaveCustomer>) => {
    const { table, dataTableRef } = props;

    return (
        <DataTableToolbar dataTableRef={dataTableRef} table={table}>
            <DataTableColumnFilter
                column={table.getColumn('name')}
            />
            <CreateCustomerModal
                onSuccess={() => window.dispatchEvent(new Event(EventListenerNames.mutateCustomers))}
            />
        </DataTableToolbar>
    );
};