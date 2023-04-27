import React, {Component} from 'react';
import {Table, Button} from 'semantic-ui-react';
import EditScheduledCustomerModal from '../editScheduledCustomerModal/editScheduledCustomerModal';
import componentWrapper from '../../utils/componentWrapper';
import { dateToStr, constructTimeStr } from '../../utils/helpers';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
//import './scheduledCustomerTable.css';

class ScheduledCustomerTable extends Component {
    render() {
        const { date, idx } = this.props;
        const scheduleDayDate = dateToStr(date);
        const scheduledCustomers = this.props.scheduledCustomers.sort((a, b) => Number(a.serviceStartTime) > Number(b.serviceStartTime) ? 1 : -1);

        return (
            <React.Fragment>
            <h1>{scheduleDayDate}</h1>
            <Table 
                celled
                className="ScheduledCustomerTable_table"
                key={idx}
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
                        scheduledCustomers.map((scheduledCustomer, customerIdx) => {
                            const serviceStartTime = constructTimeStr(scheduledCustomer.serviceStartTime);
                            const serviceEndTime = constructTimeStr(scheduledCustomer.serviceEndTime);

                            return (
                                <Table.Row key={customerIdx}>
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
                                        <Button negative>Delete</Button>
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