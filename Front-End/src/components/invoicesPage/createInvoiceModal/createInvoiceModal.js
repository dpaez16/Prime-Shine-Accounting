import React, {Component} from 'react';
import {Modal, Button, Form, Label, Input, Divider, Table, Dropdown, Icon} from 'semantic-ui-react';
import componentWrapper from '../../../utils/componentWrapper';
import { v4 as uuidV4 } from 'uuid';


class CreateInvoiceModalTable extends Component {
    createNewInvoiceService() {
        const {productId} = this.props.businessInfo;

        return {
            productId: productId,
            description: "",
            quantity: 1,
            unitPrice: 0
        };
    }

    render() {
        const {t, invoiceServices} = this.props;
        const productName = this.props.businessInfo.productName;
        
        return (
            <Table 
                celled 
                className="CreateInvoiceModal_table"
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
                                <Table.Cell>{productName}</Table.Cell>
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
                                        defaultValue={invoiceService.unitPrice}
                                        onChange={e => {
                                            const totalValue = e.target.value;
                                            const newInvoiceService = {...invoiceService, unitPrice: totalValue};
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

class CreateInvoiceModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            items: []
        };
    }

    getFormParams() {
        return Object.keys(this.state).reduce((acc, key) => {
            if (key === "modalOpen") {
                return acc;
            }

            acc[key] = this.state[key];
            return acc;
        }, {});
    }

    isFormValid() {
        const formParams = this.getFormParams();
        const OPTIONAL_FIELDS = ["memo"];

        return Object.keys(formParams).reduce((acc, key) => {
            if (OPTIONAL_FIELDS.includes(key)) {
                return acc && true;
            }

            if (key === "items") {
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
        let newInvoiceServices = [...this.state.items];
        newInvoiceServices.splice(idx, 1, newInvoiceService);

        this.setState({
            items: newInvoiceServices
        });
    }

    deleteInvoiceServiceHandler(idx) {
        const newInvoiceServices = this.state.items.filter((element, elementIdx) => idx !== elementIdx);
        
        this.setState({
            items: newInvoiceServices
        });
    }

    addInvoiceServiceHandler(newInvoiceService) {
        const newInvoiceServices = [...this.state.items, newInvoiceService];
        this.setState({
            items: newInvoiceServices
        });
    }

    render() {
        const {t, customerOptions} = this.props;

        return (
            <Modal
                onClose={() => this.setState({
                    modalOpen: false,
                    items: []
                })}
                onOpen={() => this.setState({
                    modalOpen: true,
                    items: []
                })}
                open={this.state.modalOpen}
                trigger={this.props.trigger}
            >
                <Modal.Header>{t('Create Invoice')}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>{t('Invoice Number')}:</Label>
                            <Input
                                type="text"
                                name="invoiceNumber"
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
                                onChange={this.handleFormChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('Date of Service')}:</Label>
                            <Input
                                type="date"
                                name="invoiceDate"
                                onChange={this.handleFormChange.bind(this)}
                            />
                        </Form.Field>
                        <Divider hidden />
                        <CreateInvoiceModalTable
                            t={t}
                            invoiceServices={this.state.items}
                            businessInfo={this.props.businessInfo}
                            updateInvoiceService={(idx, newInvoiceService) => this.handleInvoiceServiceChange(idx, newInvoiceService)}
                            deleteInvoiceService={(idx) => this.deleteInvoiceServiceHandler(idx)}
                            addInvoiceService={(newInvoiceService) => this.addInvoiceServiceHandler(newInvoiceService)}
                        />
                        <Form.Field>
                            <Label>{t('Memo')}:</Label>
                            <Input
                                type="text"
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

export default componentWrapper(CreateInvoiceModal);