import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {Button, Header, Container, Message} from 'semantic-ui-react';
import { BlobProvider } from '@react-pdf/renderer';
import ScheduledCustomerTable from './scheduledCustomerTable/scheduledCustomerTable';
import CreateScheduledCustomerModal from './createScheduledCustomerModal/createScheduledCustomerModal';
import SchedulePDFDocument from './schedulePdfDocument/schedulePdfDocument';
import PrimeShineAPIClient from '../../../api/primeShineApiClient';
import WaveAPIClient from '../../../api/waveApiClient';
import LoadingSegment from '../../loadingSegment/loadingSegment';
import { dateToStr, fetchAllCustomers, grabWorkingDays } from '../../../utils/helpers';
import useLocalization from '../../../hooks/useLocalization';
import { v4 as uuidV4 } from 'uuid';
import './individualSchedulePage.css';

export default function IndividualSchedulePage(props) {
    const [allCustomers, setAllCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scheduleMetadata, setScheduleMetadata] = useState({});
    const [t] = useLocalization();
    const location = useLocation();
    
    const fetchMetadataForScheduledCustomer = (businessId, rawScheduledCustomer) => {
        const customerId = rawScheduledCustomer.customerId;

        return WaveAPIClient.fetchCustomer(businessId, customerId)
        .then(customerMetadata => {
            return {
                ...rawScheduledCustomer,
                ...{metadata: customerMetadata}
            };
        })
        .catch(err => {
            throw err;
        });
    };

    const fetchMetadataForScheduledCustomers = (businessId, rawScheduledCustomers) => {
        return Promise.all(
            rawScheduledCustomers.map(async rawScheduledCustomer => await this.fetchMetadataForScheduledCustomer(businessId, rawScheduledCustomer))
        )
        .then((result) => {
            return result;
        })
    };

    useEffect(() => {
        const schedule = location.state.schedule;
        const scheduleId = schedule._id;
        const token = props.userInfo.token;
        const businessId = props.businessInfo.businessId;

        PrimeShineAPIClient.fetchScheduleDays(scheduleId, token)
        .then((scheduleDays) => {
            return Promise.all(
                scheduleDays.map(async scheduleDay => {
                    const rawScheduledCustomers = await PrimeShineAPIClient.fetchScheduledCustomers(scheduleDay._id, token);
                    const scheduledCustomers = await fetchMetadataForScheduledCustomers(businessId, rawScheduledCustomers);
                    return [scheduleDay.dayOffset, scheduledCustomers, scheduleDay._id];
                })
            )
            .then((results) => {
                let scheduleDayMap = {};
                let scheduleDayIdMap = {};

                for (let i = 0; i < 7; i++) {
                    scheduleDayMap[`${i}`] = [];
                    scheduleDayIdMap[`${i}`] = null;
                }

                results.forEach((result) => {
                    scheduleDayMap[result[0]] = result[1];
                    scheduleDayIdMap[result[0]] = result[2];
                });

                return [scheduleDayMap, scheduleDayIdMap];
            })
            .catch(err => {
                throw err;
            });
        })
        .then((results) => {
            const completeScheduleDays = results[0];
            const scheduleDayIdMap = results[1];

            setScheduleMetadata({
                ...scheduleMetadata,
                scheduleDays: completeScheduleDays,
                scheduleDayIdMap: scheduleDayIdMap
            });

            return fetchAllCustomers(businessId);
        })
        .then((newAllCustomers) => {
            setAllCustomers(newAllCustomers);
            setLoading(false);
            setError(null);
        })
        .catch(err => {
            setError(err.message);
        });
    }, []);

    const createScheduledCustomerHandler = async (dayOffset, scheduleId, dateOfService, customerId, serviceStartTime, serviceEndTime) => {
        let scheduleDayId = scheduleMetadata.scheduleDayIdMap[dayOffset];

        const businessId = props.businessInfo.businessId;
        const jwt = props.userInfo.token;

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

    const editScheduledCustomerHandler = (idx, newScheduledCustomer) => {
        const scheduleDays = scheduleMetadata.scheduleDays;

        const customerIdx = scheduleDays[idx].findIndex(scheduledCustomer => scheduledCustomer._id === newScheduledCustomer._id);
        const oldScheduledCustomerEntry = scheduleDays[idx][customerIdx];
        const newScheduledCustomerEntry = { ...oldScheduledCustomerEntry, ...newScheduledCustomer };

        const newMetadata = allCustomers.find(customer => customer.id === newScheduledCustomer.customerId);
        newScheduledCustomerEntry.metadata = newMetadata;

        let newScheduledCustomers = [...scheduleDays[idx]];
        newScheduledCustomers.splice(customerIdx, 1, newScheduledCustomerEntry);
        const newScheduleDays = { ...scheduleDays };
        newScheduleDays[idx] = newScheduledCustomers;

        setScheduleMetadata({
            ...scheduleMetadata,
            scheduleDays: newScheduleDays
        });
    };

    const deleteScheduledCustomerHandler = (idx, scheduledCustomerId) => {
        const scheduleDays = scheduleMetadata.scheduleDays;
        const customerIdx = scheduleDays[idx].findIndex(scheduledCustomer => scheduledCustomer._id === scheduledCustomerId);
        let newScheduledCustomers = [...scheduleDays[idx]];
        newScheduledCustomers.splice(customerIdx, 1);

        const newScheduleDays = { ...scheduleDays };
        newScheduleDays[idx] = newScheduledCustomers;

        setScheduleMetadata({
            ...scheduleMetadata,
            scheduleDays: newScheduleDays
        });
    };

    if (loading) {
        return (
            <LoadingSegment className='IndividualSchedulePage_loading' />
        );
    }

    const schedule = location.state.schedule;
    const scheduleDays = scheduleMetadata.scheduleDays;
    const datesOfService = [...Array(7).keys()].map(idx => {
        const date = new Date(schedule.startDay);
        date.setDate(date.getDate() + idx);
        return dateToStr(date);
    });

    return (
        <Container fluid className="IndividualSchedulePage">
            <Header as='h1'>{t('Schedule for Week of')} {datesOfService[0]} - {datesOfService[datesOfService.length - 1]}:</Header>
            <Container fluid className='IndividualSchedulePage_buttons'>
                <CreateScheduledCustomerModal
                    datesOfService={datesOfService}
                    allCustomers={allCustomers}
                    onSubmit={(dateOfService, customerId, serviceStartTime, serviceEndTime) => {
                        const dayOffset = datesOfService.findIndex((dos) => dos === dateOfService);
                        const scheduleId = schedule._id;
                        
                        createScheduledCustomerHandler(dayOffset, scheduleId, dateOfService, customerId, serviceStartTime, serviceEndTime)
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
                    {({loadingParam, url}) => {
                        if (loadingParam) {
                            return (<React.Fragment />);
                        } else {
                            return (
                                <Button onClick={() => window.open(url, '_blank')}>
                                    {t('Preview Schedule')}
                                </Button>
                            );
                        }
                    }}
                </BlobProvider>
            </Container>
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
                            idx={idx}
                            scheduledCustomers={scheduleDays[idx]}
                            allCustomers={allCustomers}
                            userInfo={props.userInfo}
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
        </Container>
    );
};