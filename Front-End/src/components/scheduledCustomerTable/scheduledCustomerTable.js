import React, {Component} from 'react';
import {Table, Button} from 'semantic-ui-react';
import componentWrapper from '../../utils/componentWrapper';
import { dateToStr, constructTimeStr } from '../../utils/helpers';
//import './scheduledCustomerTable.css';

class ScheduledCustomerTable extends Component {
    render() {
        const { date, idx, scheduledCustomers } = this.props;

        return (
            <React.Fragment>
            <h1>{dateToStr(date)}</h1>
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
                        scheduledCustomers.sort((a, b) => a.serviceStartTime < b.serviceStartTime).map((scheduledCustomer, customerIdx) => {
                            const serviceStartTime = constructTimeStr(scheduledCustomer.serviceStartTime);
                            const serviceEndTime = constructTimeStr(scheduledCustomer.serviceEndTime);
                            return (
                                <Table.Row key={customerIdx}>
                                    <Table.Cell>{scheduledCustomer.metadata.name}</Table.Cell>
                                    <Table.Cell>{serviceStartTime}</Table.Cell>
                                    <Table.Cell>{serviceEndTime}</Table.Cell>
                                    <Table.Cell>
                                        <Button>
                                            Edit
                                        </Button>
                                        <Button negative>
                                            Delete
                                        </Button>
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