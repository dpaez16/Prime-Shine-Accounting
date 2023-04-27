import React, {Component} from 'react';
import {Dimmer, Loader, Segment} from 'semantic-ui-react';
import ScheduledCustomerTable from '../scheduledCustomerTable/scheduledCustomerTable';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import WaveAPIClient from '../../api/waveApiClient';
import componentWrapper from '../../utils/componentWrapper';
import { dateToStr, fetchAllCustomers } from '../../utils/helpers';
//import './individualSchedulePage.css';

class IndividualSchedulePage extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            loading: true,
            allCustomers: []
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
                    return [scheduleDay.dayOffset, scheduledCustomers];
                })
            )
            .then((results) => {
                let scheduleDayMap = {};
                for (let i = 0; i < 7; i++) {
                    scheduleDayMap[`${i}`] = [];
                }

                results.forEach((result) => {
                    scheduleDayMap[result[0]] = result[1];
                });

                return scheduleDayMap;
            })
            .catch(err => {
                throw err;
            });
        })
        .then((completeScheduleDays) => {
            this.setState({
                scheduleDays: completeScheduleDays
            });

            return fetchAllCustomers(businessId);
        })
        .then((allCustomers) => {
            this.setState({
                allCustomers: allCustomers,
                loading: false
            });
        })
        .catch(err => console.log);
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

    render() {
        if (this.state.loading) {
            return (
                <Segment className='IndividualSchedulePage_loading'>
                    <Dimmer active 
                            inverted
                    >
                        <Loader inverted 
                                content='Loading' 
                        />
                    </Dimmer>
                </Segment>
            );
        }

        const schedule = this.props.location.state.schedule;
        const scheduleDays = this.state.scheduleDays;

        return (
            <div className="IndividualSchedulePage">
                <p>Schedule for Week of {dateToStr(schedule.startDay)}:</p>
                {
                    [...Array(7).keys()].map(idx => {
                        const date = new Date(schedule.startDay);
                        date.setDate(date.getDate() + idx);

                        return (
                            <ScheduledCustomerTable
                                date={date}
                                idx={idx}
                                key={idx}
                                scheduledCustomers={scheduleDays[idx]}
                                allCustomers={this.state.allCustomers}
                                userInfo={this.props.userInfo}
                                updateScheduledCustomer={(newScheduledCustomer) => {
                                    this.editScheduledCustomerHandler(idx, newScheduledCustomer);
                                }}
                            />
                        );
                    })
                }
            </div>
        );
    }
};

export default componentWrapper(IndividualSchedulePage);