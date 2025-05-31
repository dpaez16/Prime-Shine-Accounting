import { WaveCustomer } from '@/types/waveCustomer';
import { generateGenericTextColumn } from '@/components/ui/data-table/data-table-column-utils';
import useLocalization from '@/hooks/useLocalization';
import { useNavigate } from 'react-router-dom';

export const useCustomersTableColumns = () => {
    const navigate = useNavigate();
    const { t } = useLocalization();

    return [
        generateGenericTextColumn<WaveCustomer>({
            id: 'name',
            accessorKey: 'name',
            columnHeader: t('Name'),
            enableSorting: true,
            onClick: (entry) => {
                const params = new URLSearchParams({
                    'customerID': entry.id,
                });

                navigate(`/customer?${params.toString()}`);
            },
        }),
    ];
};