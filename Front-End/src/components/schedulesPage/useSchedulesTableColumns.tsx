import { Button } from '@/components/ui/button';
import { generateGenericDateColumn } from '@/components/ui/data-table/data-table-column-utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Schedule, ScheduleID } from '@/types/schedule';
import { dateToStr } from '@/utils/helpers';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EditScheduleModal } from './modals/editScheduleModal';
import { DeleteScheduleModal } from './modals/deleteScheduleModal';
import useLocalization from '@/hooks/useLocalization';
import { addDays } from 'date-fns';

interface UseSchedulesTableColumnsProps {
    onEdit: (startDay: Date, scheduleID: ScheduleID) => void;
    onDelete: (scheduleID: ScheduleID) => void;
}

export const useSchedulesTableColumns = (props: UseSchedulesTableColumnsProps) => {
    const navigate = useNavigate();
    const { t } = useLocalization();

    const actionsColumn: ColumnDef<Schedule> = {
        id: 'actions',
        cell: ({ row }) => {
            const schedule = row.original;

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
                                <EditScheduleModal
                                    schedule={schedule}
                                    onSubmit={(startDay) => props.onEdit(startDay, schedule.scheduleID)}
                                />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <DeleteScheduleModal
                                    startDay={schedule.startDay}
                                    onSubmit={() => props.onDelete(schedule.scheduleID)}
                                />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    };

    return [
        generateGenericDateColumn<Schedule>({
            id: 'scheduleDate',
            accessorKey: 'startDay',
            columnHeader: t('Schedule'),
            dateFormatterFunc: (date) => `${dateToStr(date!)} - ${dateToStr(addDays(date!, 6))}`,
            onClick: (entry) => {
                const params = new URLSearchParams({
                    'scheduleID': entry.scheduleID.toString(),
                });

                navigate(`/schedule?${params.toString()}`);
            },
        }),
        actionsColumn,
    ];
};