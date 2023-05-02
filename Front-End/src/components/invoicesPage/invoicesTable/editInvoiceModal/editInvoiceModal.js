import React, {Component} from 'react';
import {Modal, Button, Form, Label, Input, Divider, Table, Dropdown, Icon} from 'semantic-ui-react';

class EditInvoiceModalTable extends Component {
    createNewInvoiceService() {
        const {productId, productName} = this.props.businessInfo;

        return {
            product: {
                id: productId,
                name: productName
            },
            description: "",
            total: {
                value: 0
            }
        };
    }

    render() {
        const {invoiceId, invoiceServices} = this.props;
        
        return (
            <Table 
                celled 
                className="EditInvoiceModal_table"
            >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Items</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Price</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                {
                    invoiceServices.map((invoiceService, index) => {
                        return (
                            <Table.Row key={`${invoiceId}-${index}`}>
                                <Table.Cell>{invoiceService.product.name}</Table.Cell>
                                <Table.Cell>
                                    <Input
                                        type="text"
                                        defaultValue={invoiceService.description}
                                        onChange={e => {
                                            const description = e.target.value;
                                            const newInvoiceService = {...invoiceService, description: description};
                                            this.props.updateInvoiceService(index, newInvoiceService);
                                        }}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Input
                                        type="text"
                                        defaultValue={invoiceService.total.value}
                                        onChange={e => {
                                            const totalValue = e.target.value;
                                            const newInvoiceService = {...invoiceService, total: {value: totalValue}};
                                            this.props.updateInvoiceService(index, newInvoiceService);
                                        }}
                                    />
                                    <Icon
                                        name='trash'
                                        link={true}
                                        onClick={() => {
                                            /*
                                                TODO: bug where delete invoice item internally works, but visually does not.
                                                - appears to "skip" around the intended entry
                                            */
                                            this.props.deleteInvoiceService(index);
                                        }}
                                    />
                                </Table.Cell>
                            </Table.Row>
                        );
                    })
                }
                </Table.Body>
                <Table.Footer fullWidth>
                    <Table.Row>
                    <Table.Cell>
                        <Button
                            onClick={() => {
                                const newInvoiceService = this.createNewInvoiceService();
                                this.props.addInvoiceService(newInvoiceService);
                            }}
                        >
                            Add Item
                        </Button>
                    </Table.Cell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        );
    }
}

export default class EditInvoiceModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            invoiceServices: []
        };
    }

    handleFormChange(event, {name, value}) {
        this.setState({
            [name]: value
        });
    }

    handleInvoiceServiceChange(idx, newInvoiceService) {
        let newInvoiceServices = [...this.state.invoiceServices];
        newInvoiceServices.splice(idx, 1, newInvoiceService);

        this.setState({
            invoiceServices: newInvoiceServices
        });
    }

    deleteInvoiceServiceHandler(idx) {
        const newInvoiceServices = this.state.invoiceServices.filter((element, elementIdx) => idx !== elementIdx);
        
        this.setState({
            invoiceServices: newInvoiceServices
        });
    }

    addInvoiceServiceHandler(newInvoiceService) {
        const newInvoiceServices = [...this.state.invoiceServices, newInvoiceService];
        this.setState({
            invoiceServices: newInvoiceServices
        });
    }

    render() {
        const invoice = this.props.invoice;
        const customerOptions = this.props.customers.map(customer => {
            return {
                key: customer.id,
                value: customer.id,
                text: customer.name
            };
        });

        return (
            <Modal
                onClose={() => this.setState({
                    modalOpen: false,
                    invoiceServices: [...this.props.invoice.items]
                })}
                onOpen={() => this.setState({
                    modalOpen: true,
                    invoiceServices: [...this.props.invoice.items]
                })}
                open={this.state.modalOpen}
                trigger={this.props.trigger}
            >
                <Modal.Header>Edit an Invoice</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>Invoice Number:</Label>
                            <Input
                                type="text"
                                name="invoiceNumber"
                                defaultValue={invoice.invoiceNumber}
                                onChange={this.handleFormChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>Customer:</Label>
                            <Dropdown
                                placeholder='Select Customer'
                                fluid
                                search
                                selection
                                options={customerOptions}
                                name="customerId"
                                defaultValue={invoice.customer.id}
                                onChange={this.handleFormChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>Date of Service:</Label>
                            <Input
                                type="date"
                                name="invoiceDate"
                                defaultValue={invoice.invoiceDate}
                                onChange={this.handleFormChange.bind(this)}
                            />
                        </Form.Field>
                        <Divider hidden />
                        <EditInvoiceModalTable
                            invoiceServices={this.state.invoiceServices}
                            invoiceId={invoice.id}
                            businessInfo={this.props.businessInfo}
                            updateInvoiceService={(idx, newInvoiceService) => this.handleInvoiceServiceChange(idx, newInvoiceService)}
                            deleteInvoiceService={(idx) => this.deleteInvoiceServiceHandler(idx)}
                            addInvoiceService={(newInvoiceService) => this.addInvoiceServiceHandler(newInvoiceService)}
                        />
                        <Form.Field>
                            <Label>Memo:</Label>
                            <Input
                                type="text"
                                defaultValue={invoice.memo}
                                name="memo"
                                onChange={this.handleFormChange.bind(this)}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button 
                        color='black' 
                        onClick={() => this.setState({modalOpen: false})}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => {
                            this.props.onSubmit();
                            this.setState({modalOpen: false});
                        }}
                        disabled={false}
                        positive
                    >
                            Ok
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}