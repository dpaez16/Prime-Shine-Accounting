import React, { useContext, useEffect, useState } from 'react';
import { Button, Message } from 'semantic-ui-react';
import ScheduledCustomerTable from './scheduledCustomerTable/scheduledCustomerTable';
import PrimeShineAPIClient from '../../../api/primeShineApiClient';
import { LoadingSegment } from '../../loadingSegment/loadingSegment';
import { dateToStr, downloadBuffer } from '../../../utils/helpers';
import useLocalization from '../../../hooks/useLocalization';
import { Schedule, ScheduleID } from '@/types/schedule';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { WaveCustomer, WaveCustomerID } from '@/types/waveCustomer';
import { FullScheduledCustomer } from '@/types/scheduledCustomer';
import CreateScheduledCustomerModal from './createScheduledCustomerModal/createScheduledCustomerModal';
import { DAYS_OF_WEEK, EventListenerNames } from '@/utils/consts';
import { WaveAPIClient } from '@/api/waveApiClient';
import { useBrowserQuery } from '@/hooks/useBrowserQuery';

type IndividualCustomerPageQuery = {
    scheduleID?: string;
};

export const IndividualSchedulePage: React.FC = () => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;
    const businessInfo = context.businessInfo!;

    const [ createModalOpen, setCreateModalOpen ] = useState(false);

    const params = useBrowserQuery<IndividualCustomerPageQuery>();
    const { t } = useLocalization();
    const scheduleID = parseInt(params.scheduleID ?? '-1');

    const { data, loading, error, refetch } = useDataFetcher({
        fetcher: () => getScheduleContents(scheduleID),
    });

    useEffect(() => {
        const refetchData = () => {
            refetch();
        };

        window.addEventListener(EventListenerNames.mutateScheduledCustomers, refetchData);

        return () => {
            window.removeEventListener(EventListenerNames.mutateScheduledCustomers, refetchData);
        };
    }, []);

    const getScheduleContents = async (scheduleID: ScheduleID) => {
        const businessID = businessInfo.businessId;
        const jwt = userInfo.token;

        const schedule = await PrimeShineAPIClient.fetchSchedule(scheduleID, userInfo.token);
        const allCustomers = await WaveAPIClient.fetchAllCustomers(businessID, jwt);
        const waveCustomerByID = new Map<WaveCustomerID, WaveCustomer>();
        allCustomers.forEach(waveCustomer => {
            waveCustomerByID.set(waveCustomer.id, waveCustomer);
        });

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

        return {
            schedule,
            dayBins,
        };
    };

    const constructDatesOfService = (schedule?: Schedule): string[] => {
        if (!schedule) {
            return [];
        }

        return DAYS_OF_WEEK.map((_, idx) => {
            const date = new Date(schedule!.startDay);
            date.setUTCDate(date.getUTCDate() + idx);
            return dateToStr(date);
        });
    };

    const exportSchedule = () => {
        PrimeShineAPIClient.getSchedulePDF(scheduleID, userInfo.token)
            .then(pdf => downloadBuffer(pdf, 'schedule.pdf'))
            .catch(err => alert('Unable to export schedule: ' + err.message)); // TODO: use translation hook
    };

    if (loading) {
        return (
            <LoadingSegment />
        );
    }

    const dayBins = data?.dayBins ?? {};
    const schedule = data?.schedule;

    const datesOfService = constructDatesOfService(schedule);

    return (
        <div className='flex flex-col'>
            {
                createModalOpen &&
                <CreateScheduledCustomerModal
                    datesOfService={datesOfService}
                    scheduleID={scheduleID}
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
                                scheduleID={scheduleID}
                                scheduledCustomers={dayBins[idx]}
                            />
                        );
                    })
                }
            </div>
        </div>
    );
};