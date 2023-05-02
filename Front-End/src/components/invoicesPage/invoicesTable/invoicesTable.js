import React, {Component} from 'react';
import {Dimmer, Loader, Segment, Table, Dropdown} from 'semantic-ui-react';
import DeleteInvoiceModal from './deleteInvoiceModal/deleteInvoiceModal';
import EditInvoiceModal from './editInvoiceModal/editInvoiceModal';
import { v4 as uuidV4 } from 'uuid';

export default class InvoicesTable extends Component {
    render() {
        if (this.props.loading) {
            return (
                <Segment className='InvoicesPage_table_loading'>
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
                            <Table.Row key={uuidV4()}>
                                <Table.Cell>{invoice.status}</Table.Cell>
                                <Table.Cell>{invoice.invoiceDate}</Table.Cell>
                                <Table.Cell>{invoice.invoiceNumber}</Table.Cell>
                                <Table.Cell>{invoice.customer.name}</Table.Cell>
                                <Table.Cell>${invoice.total.value}</Table.Cell>
                                <Table.Cell>${invoice.amountDue.value}</Table.Cell>
                                <Table.Cell>
                                    <Dropdown>
                                        <Dropdown.Menu>
                                            <EditInvoiceModal
                                                trigger={<Dropdown.Item text="Edit" />}
                                                invoice={invoice}
                                                customers={this.props.customers}
                                                businessInfo={this.props.businessInfo}
                                                onSubmit={(invoicePatchData) => {
                                                    //this.props.editInvoice(invoicePatchData);
                                                }}
                                            />
                                            <DeleteInvoiceModal
                                                trigger={<Dropdown.Item text="Delete" />}
                                                invoice={invoice}
                                                onSubmit={() => {
                                                    this.props.deleteInvoice(invoice.id);
                                                }}
                                            />
                                            <Dropdown.Item 
                                                text="Download PDF"
                                                onClick={() => {
                                                    const url = invoice.pdfUrl;
                                                    window.open(url, '_blank');
                                                }}
                                            />
                                            <Dropdown.Item 
                                                text="View Invoice to Print" 
                                                onClick={() => {
                                                    const url = invoice.viewUrl;
                                                    window.open(url, '_blank');
                                                }}
                                            />
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })
                }
                </Table.Body>
            </Table>
        )
    }
};