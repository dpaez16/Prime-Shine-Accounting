import React, {Component} from 'react';
import {Table, Header, Container, Message} from 'semantic-ui-react';
import EditScheduledCustomerModal from './editScheduledCustomerModal/editScheduledCustomerModal';
import DeleteScheduleModal from './deleteScheduledCustomerModal/deleteScheduledCustomerModal';
import componentWrapper from '../../../../utils/componentWrapper';
import { constructTimeStr, getDayOfWeekStr } from '../../../../utils/helpers';
import PrimeShineAPIClient from '../../../../api/primeShineApiClient';
import { v4 as uuidv4 } from 'uuid';
//import './scheduledCustomerTable.css';

class ScheduledCustomerTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null
        };
    }

    render() {
        const { t, date } = this.props;
        const scheduleDayDate = date;
        const scheduledCustomers = this.props.scheduledCustomers.sort((a, b) => Number(a.serviceStartTime) > Number(b.serviceStartTime) ? 1 : -1);

        return (
            <React.Fragment>
            <Header as='h1'>{t(getDayOfWeekStr(scheduleDayDate))} {scheduleDayDate}</Header>
            {this.state.error && 
                <Message
                    negative
                    content={this.state.error}
                />
            }
            <Table 
                celled
                className="ScheduledCustomerTable_table"
                key={uuidv4()}
            >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>{t('Customer')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('Service Start Time')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('Service End Time')}</Table.HeaderCell>
                        <Table.HeaderCell className='ScheduledCustomerTable_table_options'>{t('Options')}</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        scheduledCustomers.map(scheduledCustomer => {
                            const serviceStartTime = constructTimeStr(scheduledCustomer.serviceStartTime);
                            const serviceEndTime = constructTimeStr(scheduledCustomer.serviceEndTime);
                            const customerElement = (
                                <Container>
                                    <p>{t('Customer')}: {scheduledCustomer.metadata.name}</p>
                                    <p>{t('Service Start Time')}: {serviceStartTime}</p>
                                    <p>{t('Service End Time')}: {serviceEndTime}</p>
                                </Container>
                            );

                            return (
                                <Table.Row key={uuidv4()}>
                                    <Table.Cell>{scheduledCustomer.metadata.name}</Table.Cell>
                                    <Table.Cell>{serviceStartTime}</Table.Cell>
                                    <Table.Cell>{serviceEndTime}</Table.Cell>
                                    <Table.Cell>
                                        <EditScheduledCustomerModal
                                            scheduledCustomer={scheduledCustomer}
                                            allCustomers={this.props.allCustomers}
                                            scheduleDayDate={scheduleDayDate}
                                            onSubmit={(newCustomerId, newServiceStartTime, newServiceEndTime) => {
                                                const scheduledCustomerId = scheduledCustomer._id;
                                                const scheduleDayId = scheduledCustomer.scheduleDay;
                                                const jwt = this.props.userInfo.token;

                                                PrimeShineAPIClient.editScheduledCustomer(
                                                    scheduledCustomerId,
                                                    newCustomerId, 
                                                    newServiceStartTime, 
                                                    newServiceEndTime, 
                                                    scheduleDayId, 
                                                    jwt
                                                )
                                                .then((newScheduledCustomer) => {
                                                    this.props.updateScheduledCustomer(newScheduledCustomer);
                                                    this.setState({
                                                        error: null
                                                    });
                                                })
                                                .catch((err) => {
                                                    this.setState({
                                                        error: err.message
                                                    });
                                                });
                                            }}
                                        />
                                        <DeleteScheduleModal
                                            customer={customerElement}
                                            onSubmit={() => {
                                                const scheduledCustomerId = scheduledCustomer._id;
                                                const jwt = this.props.userInfo.token;
                                                
                                                PrimeShineAPIClient.deleteScheduledCustomer(scheduledCustomerId, jwt)
                                                .then((didSucceed) => {
                                                    if (didSucceed) {
                                                        this.props.deleteScheduledCustomer(scheduledCustomerId);
                                                        this.setState({
                                                            error: null
                                                        });
                                                    }
                                                })
                                                .catch((err) => {
                                                    this.setState({
                                                        error: err.message
                                                    });
                                                });
                                            }}
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })
                    }
                </Table.Body>
            </Table>
            </React.Fragment>
        );
    }
};

export default componentWrapper(ScheduledCustomerTable);