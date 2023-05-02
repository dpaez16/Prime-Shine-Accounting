import React, {Component} from 'react';
import {Table, Header, Container} from 'semantic-ui-react';
import EditScheduledCustomerModal from './editScheduledCustomerModal/editScheduledCustomerModal';
import DeleteScheduleModal from './deleteScheduledCustomerModal/deleteScheduledCustomerModal';
import componentWrapper from '../../../../utils/componentWrapper';
import { constructTimeStr, getDayOfWeekStr } from '../../../../utils/helpers';
import PrimeShineAPIClient from '../../../../api/primeShineApiClient';
import { v4 as uuidv4 } from 'uuid';
//import './scheduledCustomerTable.css';

class ScheduledCustomerTable extends Component {
    render() {
        const { date } = this.props;
        const scheduleDayDate = date;
        const scheduledCustomers = this.props.scheduledCustomers.sort((a, b) => Number(a.serviceStartTime) > Number(b.serviceStartTime) ? 1 : -1);

        return (
            <React.Fragment>
            <Header as='h1'>{getDayOfWeekStr(scheduleDayDate)} {scheduleDayDate}</Header>
            <Table 
                celled
                className="ScheduledCustomerTable_table"
                key={uuidv4()}
            >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Customer</Table.HeaderCell>
                        <Table.HeaderCell>Service Start Time</Table.HeaderCell>
                        <Table.HeaderCell>Service End Time</Table.HeaderCell>
                        <Table.HeaderCell className='ScheduledCustomerTable_table_options'>Options</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        scheduledCustomers.map(scheduledCustomer => {
                            const serviceStartTime = constructTimeStr(scheduledCustomer.serviceStartTime);
                            const serviceEndTime = constructTimeStr(scheduledCustomer.serviceEndTime);
                            const customerElement = (
                                <Container>
                                    <p>Customer: {scheduledCustomer.metadata.name}</p>
                                    <p>Service Start Time: {serviceStartTime}</p>
                                    <p>Service End Time: {serviceEndTime}</p>
                                </Container>
                            );

                            return (
                                <Table.Row key={uuidv4()}>
                                    <Table.Cell>{scheduledCustomer.metadata.name}</Table.Cell>
                                    <Table.Cell>{serviceStartTime}</Table.Cell>
                                    <Table.Cell>{serviceEndTime}</Table.Cell>
                                    <Table.Cell>
                                        <EditScheduledCustomerModal
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
                                                })
                                                .catch((err) => {
                                                    console.log(err);
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
                                                    }
                                                })
                                                .catch((err) => {
                                                    console.log(err);
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