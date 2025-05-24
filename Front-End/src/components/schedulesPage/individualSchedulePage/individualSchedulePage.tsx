import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Message } from 'semantic-ui-react';
import { BlobProvider } from '@react-pdf/renderer';
import ScheduledCustomerTable from './scheduledCustomerTable/scheduledCustomerTable';
import CreateScheduledCustomerModal from './createScheduledCustomerModal/createScheduledCustomerModal';
import SchedulePDFDocument from './scheduledCustomerTable/schedulePdfDocument/schedulePdfDocument';
import PrimeShineAPIClient from '../../../api/primeShineApiClient';
import LoadingSegment from '../../loadingSegment/loadingSegment';
import { dateToStr, downloadBuffer, fetchAllCustomers, grabWorkingDays } from '../../../utils/helpers';
import useLocalization from '../../../hooks/useLocalization';
import { v4 as uuidV4 } from 'uuid';
import { WaveCustomer } from '@/types/waveCustomer';
import { ScheduledCustomer } from '@/types/scheduledCustomer';
import { Schedule } from '@/types/schedule';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { WaveAPIClient } from '@/api/waveApiClient';

type ScheduleMetadata = {
  scheduleDays: Array<ScheduledCustomer[]>;
  scheduleDayIdMap: Array<string>;
}

export default function IndividualSchedulePage() {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;
    const businessInfo = context.businessInfo!;

    const [allCustomers, setAllCustomers] = useState<WaveCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scheduleMetadata, setScheduleMetadata] = useState({} as ScheduleMetadata);
    const { t } = useLocalization();
    const location = useLocation();

    const fetchMetadataForScheduledCustomer = (businessId: string, rawScheduledCustomer: ScheduledCustomer) => {
        const customerId = rawScheduledCustomer.customerId;

        return WaveAPIClient.fetchCustomer(businessId, customerId, userInfo.token)
        .then(data => {
            return {
                ...rawScheduledCustomer,
                ...{ metadata: data.customer as WaveCustomer }
            } as ScheduledCustomer;
        })
        .catch(err => {
            throw err;
        });
    };

    const fetchMetadataForScheduledCustomers = (businessId: string, rawScheduledCustomers: ScheduledCustomer[]) => {
        return Promise.all(
            rawScheduledCustomers.map(async rawScheduledCustomer => await fetchMetadataForScheduledCustomer(businessId, rawScheduledCustomer))
        )
        .then((result) => {
            return result;
        });
    };

    useEffect(() => {
        const schedule: Schedule = location.state.schedule;
        const scheduleId = schedule._id;
        const token = userInfo.token;
        const businessId = businessInfo.businessId;

        PrimeShineAPIClient.fetchScheduleDays(scheduleId, token)
        .then(scheduleDays => {
            return Promise.all(
                scheduleDays.map(async scheduleDay => {
                    const rawScheduledCustomers = await PrimeShineAPIClient.fetchScheduledCustomers(scheduleDay._id, token);
                    const scheduledCustomers = await fetchMetadataForScheduledCustomers(businessId, rawScheduledCustomers);
                    return {
                      dayOffset: scheduleDay.dayOffset,
                      scheduledCustomers: scheduledCustomers,
                      _id: scheduleDay._id,
                    };
                })
            )
            .then((results) => {
                const scheduleDayMap = [] as Array<ScheduledCustomer[]>;
                const scheduleDayIdMap = [] as Array<string>;

                for (let i = 0; i < 7; i++) {
                    scheduleDayMap[i] = [];
                    scheduleDayIdMap[i] = '';
                }

                results.forEach((result) => {
                    const { dayOffset, scheduledCustomers, _id } = result;
                    scheduleDayMap[dayOffset] = scheduledCustomers;
                    scheduleDayIdMap[dayOffset] = _id;
                });

              return { scheduleDayMap, scheduleDayIdMap };
            })
            .catch(err => {
                throw err;
            });
        })
        .then((results) => {
            const completeScheduleDays = results.scheduleDayMap;
            const scheduleDayIdMap = results.scheduleDayIdMap;

            setScheduleMetadata({
                ...scheduleMetadata,
                scheduleDays: completeScheduleDays,
                scheduleDayIdMap: scheduleDayIdMap
            });

            return fetchAllCustomers(businessId, userInfo.token);
        })
        .then((newAllCustomers) => {
            setAllCustomers(newAllCustomers);
            setLoading(false);
            setError(null);
        })
        .catch(err => {
            setLoading(false);
            setError(err.message);
        });
    }, []);

    const createScheduledCustomerHandler = async (
      dayOffset: number,
      scheduleId: string,
      customerId: string,
      serviceStartTime: Date,
      serviceEndTime: Date
    ) => {
        let scheduleDayId = scheduleMetadata.scheduleDayIdMap[dayOffset];

        const businessId = businessInfo.businessId;
        const jwt = userInfo.token;

        if (!scheduleDayId) {
            const newScheduleDay = await PrimeShineAPIClient.createScheduleDay(dayOffset, scheduleId, jwt);
            scheduleDayId = newScheduleDay._id;
        }

        const rawScheduledCustomer = await PrimeShineAPIClient.createScheduledCustomer(customerId, serviceStartTime, serviceEndTime, scheduleDayId, jwt);
        const newScheduledCustomer = await fetchMetadataForScheduledCustomer(businessId, rawScheduledCustomer);

        const newScheduleDayIdMap = { ...scheduleMetadata.scheduleDayIdMap };
        newScheduleDayIdMap[dayOffset] = scheduleDayId;

        const newScheduleDays = { ...scheduleMetadata.scheduleDays };
        newScheduleDays[dayOffset].push(newScheduledCustomer);

        setScheduleMetadata({
            ...scheduleMetadata,
            scheduleDayIdMap: newScheduleDayIdMap,
            scheduleDays: newScheduleDays
        });
        setError(null);
    };

    const editScheduledCustomerHandler = (idx: number, newScheduledCustomer: ScheduledCustomer) => {
        const scheduleDays = scheduleMetadata.scheduleDays;

        const customerIdx = scheduleDays[idx].findIndex(scheduledCustomer => scheduledCustomer._id === newScheduledCustomer._id);
        const oldScheduledCustomerEntry = scheduleDays[idx][customerIdx];
        const newScheduledCustomerEntry = { ...oldScheduledCustomerEntry, ...newScheduledCustomer };

        const newMetadata = allCustomers.find(customer => customer.id === newScheduledCustomer.customerId);
        if (!newMetadata) {
          return;
        }

        newScheduledCustomerEntry.metadata = newMetadata;

        const newScheduledCustomers = [...scheduleDays[idx]];
        newScheduledCustomers.splice(customerIdx, 1, newScheduledCustomerEntry);
        const newScheduleDays = { ...scheduleDays };
        newScheduleDays[idx] = newScheduledCustomers;

        setScheduleMetadata({
            ...scheduleMetadata,
            scheduleDays: newScheduleDays
        });
    };

    const deleteScheduledCustomerHandler = (idx: number, scheduledCustomerId: string) => {
        const scheduleDays = scheduleMetadata.scheduleDays;
        const customerIdx = scheduleDays[idx].findIndex(scheduledCustomer => scheduledCustomer._id === scheduledCustomerId);
        const newScheduledCustomers = [...scheduleDays[idx]];
        newScheduledCustomers.splice(customerIdx, 1);

        const newScheduleDays = { ...scheduleDays };
        newScheduleDays[idx] = newScheduledCustomers;

        setScheduleMetadata({
            ...scheduleMetadata,
            scheduleDays: newScheduleDays
        });
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

    const schedule = location.state.schedule as Schedule;
    const scheduleDays = scheduleMetadata.scheduleDays;
    const datesOfService = [...Array(7).keys()].map(idx => {
        const date = new Date(schedule.startDay);
        date.setDate(date.getDate() + idx);
        return dateToStr(date);
    });

    return (
        <div className='flex flex-col'>
            <h1>{t('Schedule for Week of')} {datesOfService[0]} - {datesOfService[datesOfService.length - 1]}:</h1>
            <div className='flex flex-row gap-2'>
                <CreateScheduledCustomerModal
                    datesOfService={datesOfService}
                    allCustomers={allCustomers}
                    onSubmit={(dateOfService, customerId, serviceStartTime, serviceEndTime) => {
                        const dayOffset = datesOfService.findIndex((dos) => dos === dateOfService);
                        const scheduleId = schedule._id;

                        createScheduledCustomerHandler(dayOffset, scheduleId, customerId, serviceStartTime, serviceEndTime)
                        .catch(err => {
                            setError(err.message);
                        });
                    }}
                />
                <BlobProvider
                    document={
                        <SchedulePDFDocument
                            datesOfService={datesOfService}
                            scheduleDays={scheduleDays}
                        />
                    }
                >
                    {(blobObj) => {
                        const { loading, url } = blobObj;
                        return (
                            <Button onClick={() => url && window.open(url, '_blank')}
                                    disabled={loading || scheduleDays === undefined || !url}
                                    loading={loading}
                            >
                                {t('Preview Schedule')}
                            </Button>
                        );
                    }}
                </BlobProvider>
                <Button onClick={exportSchedule}>
                    Export Schedule
                </Button>
            </div>
            {error &&
                <Message
                    negative
                    content={error}
                />
            }
            {
                grabWorkingDays(datesOfService).map((date, idx) => {
                    return (
                        <ScheduledCustomerTable
                            key={uuidV4()}
                            date={date}
                            scheduledCustomers={scheduleDays[idx]}
                            allCustomers={allCustomers}
                            updateScheduledCustomer={(newScheduledCustomer) => {
                                editScheduledCustomerHandler(idx, newScheduledCustomer);
                            }}
                            deleteScheduledCustomer={(scheduledCustomerId) => {
                                deleteScheduledCustomerHandler(idx, scheduledCustomerId);
                            }}
                        />
                    );
                })
            }
        </div>
    );
};
