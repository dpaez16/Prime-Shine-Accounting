import React, { useState } from 'react';
import { Button, Table } from 'semantic-ui-react';
import { constructTimeStr, getDayOfWeekStr } from '../../../../utils/helpers';
import useLocalization from '../../../../hooks/useLocalization';
import { FullScheduledCustomer } from '@/types/scheduledCustomer';
import { ScheduleID } from '@/types/schedule';
import { DeleteScheduledCustomerModal } from './deleteScheduledCustomerModal/deleteScheduledCustomerModal';
import { EventListenerNames } from '@/utils/consts';
import { EditScheduledCustomerModal } from './editScheduledCustomerModal/editScheduledCustomerModal';

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
            <h1>
                {t(getDayOfWeekStr(scheduleDayDate))} {scheduleDayDate}
            </h1>
            {isEmpty && <p>{t('No one is scheduled for this day.')}</p>}
            {
                !isEmpty &&
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{t('Customer')}</Table.HeaderCell>
                            <Table.HeaderCell>{t('Service Start Time')}</Table.HeaderCell>
                            <Table.HeaderCell>{t('Service End Time')}</Table.HeaderCell>
                            <Table.HeaderCell>{t('Options')}</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {scheduledCustomers.map((scheduledCustomer, idx) => {
                            const startTime = constructTimeStr(scheduledCustomer.startTime);
                            const endTime = constructTimeStr(scheduledCustomer.endTime);

                            return (
                                <Table.Row key={idx}>
                                    <Table.Cell>{scheduledCustomer.metadata.name}</Table.Cell>
                                    <Table.Cell>{startTime}</Table.Cell>
                                    <Table.Cell>{endTime}</Table.Cell>
                                    <Table.Cell>
                                    <Button
                                        onClick={() => setEditScheduledCustomer(scheduledCustomer)}
                                    >
                                        {t('Edit')}
                                    </Button>
                                    <Button
                                        negative
                                        onClick={() => setDeleteScheduledCustomer(scheduledCustomer)}
                                    >
                                        {t('Delete')}
                                    </Button>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
            }
        </div>
    );
};