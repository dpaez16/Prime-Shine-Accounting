import React, {Component} from 'react';
import {Modal, Button, Form, Label, Input, Divider, Table, Dropdown, Icon} from 'semantic-ui-react';
import componentWrapper from '../../../../utils/componentWrapper';
import { v4 as uuidV4 } from 'uuid';

class EditInvoiceModalTable extends Component {
    createNewInvoiceService() {
        const {productId, productName} = this.props.businessInfo;

        return {
            productId: {
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
        const {t, invoiceServices} = this.props;
        
        return (
            <Table 
                celled 
                className="EditInvoiceModal_table"
            >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>{t('Items')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('Description')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('Price')}</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                {
                    invoiceServices.map((invoiceService, index) => {
                        return (
                            <Table.Row key={uuidV4()}>
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
                            {t('Add Item')}
                        </Button>
                    </Table.Cell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        );
    }
};

class EditInvoiceModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            invoiceServices: []
        };
    }

    getFormParams() {
        const formParams = Object.keys(this.state).reduce((acc, key) => {
            if (key === "modalOpen") {
                return acc;
            }

            acc[key] = this.state[key];
            return acc;
        }, {...this.props.invoice});

        return {
            id: formParams.id,
            customerId: formParams.customer.id,
            invoiceDate: formParams.invoiceDate,
            items: formParams.invoiceServices.map(invoiceService => {
                return {
                    productId: invoiceService.product.id,
                    description: invoiceService.description,
                    quantity: 1,
                    unitPrice: invoiceService.total.value
                };
            }),
            memo: formParams.memo
        };
    }

    isFormValid() {
        const formParams = this.getFormParams();
        const OPTIONAL_FIELDS = ["memo"];

        return Object.keys(formParams).reduce((acc, key) => {
            if (OPTIONAL_FIELDS.includes(key)) {
                return acc && true;
            }

            if (key === "invoiceServices") {
                return acc && formParams[key].length > 0;
            }

            return acc && formParams[key] !== '';
        }, true);
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
        const {t, invoice} = this.props;
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
                <Modal.Header>{t('Edit Invoice')}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>{t('Invoice Number')}:</Label>
                            <Input
                                type="text"
                                name="invoiceNumber"
                                defaultValue={invoice.invoiceNumber}
                                onChange={this.handleFormChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('Customer')}:</Label>
                            <Dropdown
                                placeholder={t('Select Customer')}
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
                            <Label>{t('Date of Service')}:</Label>
                            <Input
                                type="date"
                                name="invoiceDate"
                                defaultValue={invoice.invoiceDate}
                                onChange={this.handleFormChange.bind(this)}
                            />
                        </Form.Field>
                        <Divider hidden />
                        <EditInvoiceModalTable
                            t={t}
                            invoiceServices={this.state.invoiceServices}
                            businessInfo={this.props.businessInfo}
                            updateInvoiceService={(idx, newInvoiceService) => this.handleInvoiceServiceChange(idx, newInvoiceService)}
                            deleteInvoiceService={(idx) => this.deleteInvoiceServiceHandler(idx)}
                            addInvoiceService={(newInvoiceService) => this.addInvoiceServiceHandler(newInvoiceService)}
                        />
                        <Form.Field>
                            <Label>{t('Memo')}:</Label>
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
                        {t('Cancel')}
                    </Button>
                    <Button 
                        onClick={() => {
                            const formParams = this.getFormParams();
                            this.props.onSubmit(formParams);
                            this.setState({modalOpen: false});
                        }}
                        disabled={!this.isFormValid()}
                        positive
                    >
                            Ok
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
};

export default componentWrapper(EditInvoiceModal);