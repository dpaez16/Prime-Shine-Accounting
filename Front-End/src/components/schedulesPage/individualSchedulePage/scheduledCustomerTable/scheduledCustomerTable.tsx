import React, { useContext, useState } from 'react';
import { Table, Message } from 'semantic-ui-react';
import EditScheduledCustomerModal from './editScheduledCustomerModal/editScheduledCustomerModal';
import DeleteScheduleModal from './deleteScheduledCustomerModal/deleteScheduledCustomerModal';
import { constructTimeStr, getDayOfWeekStr } from '../../../../utils/helpers';
import PrimeShineAPIClient from '../../../../api/primeShineApiClient';
import useLocalization from '../../../../hooks/useLocalization';
import { v4 as uuidv4 } from 'uuid';
import { ScheduledCustomer } from '@/types/scheduledCustomer';
import { WaveCustomer } from '@/types/waveCustomer';
import { LoginSessionContext } from '@/context/LoginSessionContext';

type ScheduledCustomerTableProps = {
  allCustomers: WaveCustomer[];
  scheduledCustomers: ScheduledCustomer[];
  date: string;
  updateScheduledCustomer: (scheduledCustomer: ScheduledCustomer) => void;
  deleteScheduledCustomer: (scheduledCustomerId: string) => void;
};

export default function ScheduledCustomerTable(props: ScheduledCustomerTableProps) {
  const context = useContext(LoginSessionContext);
  const userInfo = context.userInfo!;

  const [error, setError] = useState(null);
  const { t } = useLocalization();

  const { date } = props;
  const scheduleDayDate = date;
  const scheduledCustomers = props.scheduledCustomers.sort((a, b) => {
    const dateA = new Date(a.serviceStartTime);
    const dateB = new Date(b.serviceStartTime);
    return Number(dateA) > Number(dateB) ? 1 : -1;
  });

  return (
    <React.Fragment>
      <h1>
        {t(getDayOfWeekStr(scheduleDayDate))} {scheduleDayDate}
      </h1>
      {error && <Message negative content={error} />}
      <Table celled className='ScheduledCustomerTable_table' key={uuidv4()}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t('Customer')}</Table.HeaderCell>
            <Table.HeaderCell>{t('Service Start Time')}</Table.HeaderCell>
            <Table.HeaderCell>{t('Service End Time')}</Table.HeaderCell>
            <Table.HeaderCell className='ScheduledCustomerTable_table_options'>
              {t('Options')}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {scheduledCustomers.map((scheduledCustomer) => {
            const serviceStartTime = constructTimeStr(
              scheduledCustomer.serviceStartTime,
            );
            const serviceEndTime = constructTimeStr(
              scheduledCustomer.serviceEndTime,
            );
            const customerElement = (
              <div>
                <p>
                  {t('Customer')}: {scheduledCustomer.metadata.name}
                </p>
                <p>
                  {t('Service Start Time')}: {serviceStartTime}
                </p>
                <p>
                  {t('Service End Time')}: {serviceEndTime}
                </p>
              </div>
            );

            return (
              <Table.Row key={uuidv4()}>
                <Table.Cell>{scheduledCustomer.metadata.name}</Table.Cell>
                <Table.Cell>{serviceStartTime}</Table.Cell>
                <Table.Cell>{serviceEndTime}</Table.Cell>
                <Table.Cell>
                  <EditScheduledCustomerModal
                    scheduledCustomer={scheduledCustomer}
                    allCustomers={props.allCustomers}
                    scheduleDayDate={scheduleDayDate}
                    onSubmit={(
                      newCustomerId: string,
                      newServiceStartTime: Date,
                      newServiceEndTime: Date,
                    ) => {
                      const scheduledCustomerId = scheduledCustomer._id;
                      const scheduleDayId = scheduledCustomer.scheduleDay;
                      const jwt = userInfo.token;

                      PrimeShineAPIClient.editScheduledCustomer(
                        scheduledCustomerId,
                        newCustomerId,
                        newServiceStartTime,
                        newServiceEndTime,
                        scheduleDayId,
                        jwt,
                      )
                        .then((newScheduledCustomer) => {
                          props.updateScheduledCustomer(newScheduledCustomer);
                          setError(null);
                        })
                        .catch((err) => {
                          setError(err.message);
                        });
                    }}
                  />
                  <DeleteScheduleModal
                    customer={customerElement}
                    onSubmit={() => {
                      const scheduledCustomerId = scheduledCustomer._id;
                      const jwt = userInfo.token;

                      PrimeShineAPIClient.deleteScheduledCustomer(
                        scheduledCustomerId,
                        jwt,
                      )
                        .then((didSucceed) => {
                          if (didSucceed) {
                            props.deleteScheduledCustomer(scheduledCustomerId);
                            setError(null);
                          }
                        })
                        .catch((err) => {
                          setError(err.message);
                        });
                    }}
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </React.Fragment>
  );
}
