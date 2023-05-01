import React, {Component} from 'react';
import {Table} from 'semantic-ui-react';

export default class InvoicesTable extends Component {
    render() {
        return (
            <Table className='InvoicesPage_table'>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Number</Table.HeaderCell>
                        <Table.HeaderCell>Customer</Table.HeaderCell>
                        <Table.HeaderCell>Total</Table.HeaderCell>
                        <Table.HeaderCell>Amount Due</Table.HeaderCell>
                        <Table.HeaderCell>Options</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                {
                    this.props.invoices.map((invoice, idx) => {
                        return (
                            <Table.Row key={idx}>
                                <Table.Cell>{invoice.status}</Table.Cell>
                                <Table.Cell>{invoice.invoiceDate}</Table.Cell>
                                <Table.Cell>{invoice.invoiceNumber}</Table.Cell>
                                <Table.Cell>{invoice.customer.name}</Table.Cell>
                                <Table.Cell>{invoice.total.value}</Table.Cell>
                                <Table.Cell>{invoice.amountDue.value}</Table.Cell>
                                <Table.Cell>Options</Table.Cell>
                            </Table.Row>
                        );
                    })
                }
                </Table.Body>
            </Table>
        )
    }
};