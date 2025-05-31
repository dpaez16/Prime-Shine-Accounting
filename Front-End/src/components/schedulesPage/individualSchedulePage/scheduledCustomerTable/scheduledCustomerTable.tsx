import React, { useState } from 'react';
import { getDayOfWeekStr } from '@/utils/helpers';
import useLocalization from '@/hooks/useLocalization';
import { FullScheduledCustomer } from '@/types/scheduledCustomer';
import { ScheduleID } from '@/types/schedule';
import { DeleteScheduledCustomerModal } from './modals/deleteScheduledCustomerModal';
import { EventListenerNames } from '@/utils/consts';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useScheduledCustomerTableColumns } from './useScheduledCustomerTableColumns';
import { PageHeader } from '@/components/ui/page-header';
import { EditScheduledCustomerModal } from './modals/edit/editScheduledCustomerModal';

type ScheduledCustomerTableProps = {
    date: string;
    scheduleID: ScheduleID;
    scheduledCustomers: FullScheduledCustomer[];
};

export const ScheduledCustomerTable: React.FC<ScheduledCustomerTableProps> = (props) => {
    const [ editScheduledCustomer, setEditScheduledCustomer ] = useState<FullScheduledCustomer | null>(null);
    const [ deleteScheduledCustomer, setDeleteScheduledCustomer ] = useState<FullScheduledCustomer | null>(null);
    const { t } = useLocalization();

    const { date } = props;
    const scheduleDayDate = date;
    const scheduledCustomers = props.scheduledCustomers.sort((a, b) => {
        const dateA = new Date(a.startTime);
        const dateB = new Date(b.endTime);
        return dateA.getTime() - dateB.getTime();
    });

    const isEmpty = scheduledCustomers.length === 0;
    const columns = useScheduledCustomerTableColumns({
        onEditClick: setEditScheduledCustomer,
        onDeleteClick: setDeleteScheduledCustomer,
    });

    return (
        <div className='flex flex-col'>
            {
                editScheduledCustomer !== null &&
                <EditScheduledCustomerModal
                    dateOfService={props.date}
                    scheduleID={props.scheduleID}
                    scheduledCustomer={editScheduledCustomer}
                    onClose={() => setEditScheduledCustomer(null)}
                    onSubmit={() => {
                        setEditScheduledCustomer(null);
                        window.dispatchEvent(new Event(EventListenerNames.mutateScheduledCustomers));
                    }}
                />
            }
            {
                deleteScheduledCustomer !== null &&
                <DeleteScheduledCustomerModal
                    scheduledCustomer={deleteScheduledCustomer}
                    onClose={() => setDeleteScheduledCustomer(null)}
                    onSubmit={() => {
                        setDeleteScheduledCustomer(null);
                        window.dispatchEvent(new Event(EventListenerNames.mutateScheduledCustomers));
                    }}
                />
            }
            <PageHeader>
                {t(getDayOfWeekStr(scheduleDayDate))} {scheduleDayDate}
            </PageHeader>
            {isEmpty && <p className='mt-2'>{t('No one is scheduled for this day.')}</p>}
            {!isEmpty && <DataTable className='mt-4' data={scheduledCustomers} columns={columns} />}
        </div>
    );
};