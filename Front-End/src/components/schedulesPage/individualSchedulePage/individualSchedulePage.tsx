import React, { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Message } from 'semantic-ui-react';
import ScheduledCustomerTable from './scheduledCustomerTable/scheduledCustomerTable';
import PrimeShineAPIClient from '../../../api/primeShineApiClient';
import LoadingSegment from '../../loadingSegment/loadingSegment';
import { dateToStr, downloadBuffer, fetchAllCustomers } from '../../../utils/helpers';
import useLocalization from '../../../hooks/useLocalization';
import { Schedule, ScheduleID } from '@/types/schedule';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { WaveCustomer, WaveCustomerID } from '@/types/waveCustomer';
import { FullScheduledCustomer } from '@/types/scheduledCustomer';
import CreateScheduledCustomerModal from './createScheduledCustomerModal/createScheduledCustomerModal';
import { DAYS_OF_WEEK } from '@/utils/consts';

export default function IndividualSchedulePage() {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;
    const businessInfo = context.businessInfo!;

    const [ createModalOpen, setCreateModalOpen ] = useState(false);

    const { t } = useLocalization();
    const location = useLocation();
    const schedule = location.state.schedule as Schedule;

    const { data, loading, error, refetch } = useDataFetcher({
        fetcher: () => getScheduleContents(schedule._id),
    });

    const getScheduleContents = async (scheduleID: ScheduleID) => {
        const businessID = businessInfo.businessId;
        const jwt = userInfo.token;

        const allCustomers = await fetchAllCustomers(businessID, jwt);
        const waveCustomerByID = new Map<WaveCustomerID, WaveCustomer>();
        allCustomers.forEach(waveCustomer => {
            waveCustomerByID.set(waveCustomer.id, waveCustomer);
        })

        const dayBins: Record<number, FullScheduledCustomer[]> = {};
        for (let idx = 0; idx < DAYS_OF_WEEK.length; idx++) {
            dayBins[idx] = [];
        }

        const scheduledCustomers = await PrimeShineAPIClient.fetchScheduledCustomers(scheduleID, jwt);
        scheduledCustomers.forEach(scheduledCustomer => {
            const waveCustomer = waveCustomerByID.get(scheduledCustomer.waveCustomerID);
            if (!waveCustomer) {
                return;
            }

            const fullScheduledCustomer = {
                ...scheduledCustomer,
                metadata: waveCustomer,
            } as FullScheduledCustomer;

            const idx = scheduledCustomer.dayOffset;
            dayBins[idx].push(fullScheduledCustomer);
        });

        return dayBins;
    };

    const exportSchedule = () => {
        PrimeShineAPIClient.getSchedulePDF(schedule._id, userInfo.token)
            .then(pdf => downloadBuffer(pdf, 'schedule.pdf'))
            .catch(err => alert('Unable to export schedule: ' + err.message)); // TODO: use translation hook
    };

    if (loading) {
        return (
            <LoadingSegment />
        );
    }

    const datesOfService = [...Array(7).keys()].map(idx => {
        const date = new Date(schedule.startDay);
        date.setUTCDate(date.getUTCDate() + idx);
        return dateToStr(date);
    });

    const dayBins = data ?? {};

    return (
        <div className='flex flex-col'>
            {
                createModalOpen &&
                <CreateScheduledCustomerModal
                    datesOfService={datesOfService}
                    scheduleID={schedule._id}
                    onSubmit={() => {
                        refetch();
                        setCreateModalOpen(false);
                    }}
                    onClose={() => setCreateModalOpen(false)}
                />
            }
            <h1>{t('Schedule for Week of')} {datesOfService[0]} - {datesOfService[datesOfService.length - 1]}:</h1>
            <div className='flex flex-row gap-2'>
                <Button onClick={() => setCreateModalOpen(true)}>
                    {t('Add Customer')}
                </Button>
                <Button onClick={exportSchedule}>
                    {t('Download Schedule')}
                </Button>
            </div>
            {error && <Message negative content={error.message} />}
            <div className='flex flex-col gap-10 mt-10'>
                {
                    datesOfService.map((date, idx) => {
                        return (
                            <ScheduledCustomerTable
                                key={idx}
                                date={date}
                                scheduleID={schedule._id}
                                scheduledCustomers={dayBins[idx]}
                            />
                        );
                    })
                }
            </div>
        </div>
    );
};
