import React, { useContext } from 'react';
import { Button, Table } from 'semantic-ui-react';
import { constructTimeStr, getDayOfWeekStr } from '../../../../utils/helpers';
import useLocalization from '../../../../hooks/useLocalization';
import { v4 as uuidv4 } from 'uuid';
import { FullScheduledCustomer } from '@/types/scheduledCustomer';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { ScheduleID } from '@/types/schedule';

type ScheduledCustomerTableProps = {
    date: string;
    scheduleID: ScheduleID;
    scheduledCustomers: FullScheduledCustomer[];
};

export default function ScheduledCustomerTable(props: ScheduledCustomerTableProps) {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;

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
            <h1>
                {t(getDayOfWeekStr(scheduleDayDate))} {scheduleDayDate}
            </h1>
            {isEmpty && <p>{t('No one is scheduled for this day.')}</p>}
            {!isEmpty && <Table celled className='ScheduledCustomerTable_table' key={uuidv4()}>
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
                                <Button>{t('Edit')}</Button>
                                <Button negative>{t('Delete')}</Button>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>}
        </div>
    );
}
