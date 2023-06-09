import React, {Component} from 'react';
import {Button, Header, Container, Message} from 'semantic-ui-react';
import { BlobProvider } from '@react-pdf/renderer';
import ScheduledCustomerTable from './scheduledCustomerTable/scheduledCustomerTable';
import CreateScheduledCustomerModal from './createScheduledCustomerModal/createScheduledCustomerModal';
import SchedulePDFDocument from './schedulePdfDocument/schedulePdfDocument';
import PrimeShineAPIClient from '../../../api/primeShineApiClient';
import WaveAPIClient from '../../../api/waveApiClient';
import componentWrapper from '../../../utils/componentWrapper';
import LoadingSegment from '../../../utils/loadingSegment/loadingSegment';
import { dateToStr, fetchAllCustomers, grabWorkingDays } from '../../../utils/helpers';
import { v4 as uuidV4 } from 'uuid';
import './individualSchedulePage.css';

class IndividualSchedulePage extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            loading: true,
            allCustomers: [],
            error: null
        }
    }

    fetchMetadataForScheduledCustomer(businessId, rawScheduledCustomer) {
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
    }

    fetchMetadataForScheduledCustomers(businessId, rawScheduledCustomers) {
        return Promise.all(
            rawScheduledCustomers.map(async rawScheduledCustomer => await this.fetchMetadataForScheduledCustomer(businessId, rawScheduledCustomer))
        )
        .then((result) => {
            return result;
        })
    }

    componentDidMount() {
        const schedule = this.props.location.state.schedule;
        const scheduleId = schedule._id;
        const token = this.props.userInfo.token;
        const businessId = this.props.businessInfo.businessId;

        PrimeShineAPIClient.fetchScheduleDays(scheduleId, token)
        .then((scheduleDays) => {
            return Promise.all(
                scheduleDays.map(async scheduleDay => {
                    const rawScheduledCustomers = await PrimeShineAPIClient.fetchScheduledCustomers(scheduleDay._id, token);
                    const scheduledCustomers = await this.fetchMetadataForScheduledCustomers(businessId, rawScheduledCustomers);
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

            this.setState({
                scheduleDays: completeScheduleDays,
                scheduleDayIdMap: scheduleDayIdMap
            });

            return fetchAllCustomers(businessId);
        })
        .then((allCustomers) => {
            this.setState({
                allCustomers: allCustomers,
                loading: false,
                error: null
            });
        })
        .catch(err => {
            this.setState({
                error: err.message
            });
        });
    }

    async createScheduledCustomerHandler(dayOffset, scheduleId, dateOfService, customerId, serviceStartTime, serviceEndTime) {
        let scheduleDayId = this.state.scheduleDayIdMap[dayOffset];

        const businessId = this.props.businessInfo.businessId;
        const jwt = this.props.userInfo.token;

        if (!scheduleDayId) {
            const newScheduleDay = await PrimeShineAPIClient.createScheduleDay(dayOffset, scheduleId, jwt);
            scheduleDayId = newScheduleDay._id;
        }

        const rawScheduledCustomer = await PrimeShineAPIClient.createScheduledCustomer(customerId, serviceStartTime, serviceEndTime, scheduleDayId, jwt);
        const newScheduledCustomer = await this.fetchMetadataForScheduledCustomer(businessId, rawScheduledCustomer);

        const newScheduleDayIdMap = { ...this.state.scheduleDayIdMap };
        newScheduleDayIdMap[dayOffset] = scheduleDayId;

        const newScheduleDays = { ...this.state.scheduleDays };
        newScheduleDays[dayOffset].push(newScheduledCustomer);

        this.setState({
            scheduleDayIdMap: newScheduleDayIdMap,
            scheduleDays: newScheduleDays,
            error: null
        });
    }

    editScheduledCustomerHandler(idx, newScheduledCustomer) {
        const scheduleDays = this.state.scheduleDays;

        const customerIdx = scheduleDays[idx].findIndex(scheduledCustomer => scheduledCustomer._id === newScheduledCustomer._id);
        const oldScheduledCustomerEntry = scheduleDays[idx][customerIdx];
        const newScheduledCustomerEntry = { ...oldScheduledCustomerEntry, ...newScheduledCustomer };

        const newMetadata = this.state.allCustomers.find(customer => customer.id === newScheduledCustomer.customerId);
        newScheduledCustomerEntry.metadata = newMetadata;

        let newScheduledCustomers = [...scheduleDays[idx]];
        newScheduledCustomers.splice(customerIdx, 1, newScheduledCustomerEntry);
        const newScheduleDays = { ...scheduleDays };
        newScheduleDays[idx] = newScheduledCustomers;

        this.setState({
            scheduleDays: newScheduleDays
        });
    }

    deleteScheduledCustomerHandler(idx, scheduledCustomerId) {
        const scheduleDays = this.state.scheduleDays;
        const customerIdx = scheduleDays[idx].findIndex(scheduledCustomer => scheduledCustomer._id === scheduledCustomerId);
        let newScheduledCustomers = [...scheduleDays[idx]];
        newScheduledCustomers.splice(customerIdx, 1);

        const newScheduleDays = { ...scheduleDays };
        newScheduleDays[idx] = newScheduledCustomers;

        this.setState({
            scheduleDays: newScheduleDays
        });
    }

    render() {
        if (this.state.loading) {
            return (
                <LoadingSegment className='IndividualSchedulePage_loading' />
            );
        }

        const {t} = this.props;
        const schedule = this.props.location.state.schedule;
        const scheduleDays = this.state.scheduleDays;
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
                        allCustomers={this.state.allCustomers}
                        onSubmit={(dateOfService, customerId, serviceStartTime, serviceEndTime) => {
                            const dayOffset = datesOfService.findIndex((dos) => dos === dateOfService);
                            const scheduleId = schedule._id;
                            
                            this.createScheduledCustomerHandler(dayOffset, scheduleId, dateOfService, customerId, serviceStartTime, serviceEndTime)
                            .catch(err => {
                                this.setState({
                                    error: err.message
                                });
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
                        {({loading, url}) => {
                            if (loading) {
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
                {this.state.error && 
                    <Message
                        negative
                        content={this.state.error}
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
                                allCustomers={this.state.allCustomers}
                                userInfo={this.props.userInfo}
                                updateScheduledCustomer={(newScheduledCustomer) => {
                                    this.editScheduledCustomerHandler(idx, newScheduledCustomer);
                                }}
                                deleteScheduledCustomer={(scheduledCustomerId) => {
                                    this.deleteScheduledCustomerHandler(idx, scheduledCustomerId);
                                }}
                            />
                        );
                    })
                }
            </Container>
        );
    }
};

export default componentWrapper(IndividualSchedulePage);