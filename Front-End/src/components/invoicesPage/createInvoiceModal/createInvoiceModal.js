import {useState} from 'react';
import {Modal, Button, Form, Label, Input, Divider, Table, Dropdown, Icon} from 'semantic-ui-react';
import useLocalization from '../../../hooks/useLocalization';
import { v4 as uuidV4 } from 'uuid';


function CreateInvoiceModalTable(props) {
    const createNewInvoiceService = () => {
        const {productId} = props.businessInfo;

        return {
            productId: productId,
            description: "",
            quantity: 1,
            unitPrice: 0
        };
    };

    const {t, invoiceServices} = props;
    const productName = props.businessInfo.productName;
    
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
                                        props.updateInvoiceService(index, newInvoiceService);
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
                                        props.updateInvoiceService(index, newInvoiceService);
                                    }}
                                />
                                <Icon
                                    name='trash'
                                    link={true}
                                    onClick={() => {
                                        props.deleteInvoiceService(index);
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
                            const newInvoiceService = createNewInvoiceService();
                            props.addInvoiceService(newInvoiceService);
                        }}
                    >
                        {t('Add Item')}
                    </Button>
                </Table.Cell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
};

export default function CreateInvoiceModal(props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [invoiceParams, setInvoiceParams] = useState({});
    const [t] = useLocalization();

    const getFormParams = () => {
        return {
            ...invoiceParams,
            items: items
        };
    };

    const isFormValid = () => {
        const formParams = getFormParams();
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

    const handleFormChange = (event, {name, value}) => {
        setInvoiceParams({
            ...invoiceParams,
            [name]: value
        });
    };

    const handleInvoiceServiceChange = (idx, newInvoiceService) => {
        let newInvoiceServices = [...items];
        newInvoiceServices.splice(idx, 1, newInvoiceService);
        setItems(newInvoiceServices);
    };

    const deleteInvoiceServiceHandler = (idx) => {
        const newInvoiceServices = items.filter((element, elementIdx) => idx !== elementIdx);        
        setItems(newInvoiceServices);
    };

    const addInvoiceServiceHandler = (newInvoiceService) => {
        const newInvoiceServices = [...items, newInvoiceService];
        setItems(newInvoiceServices);
    };

    const {customerOptions} = props;

    return (
        <Modal
            onClose={() => {
                setModalOpen(false);
                setItems([]);
            }}
            onOpen={() => {
                setModalOpen(true);
                setItems([]);
            }}
            open={modalOpen}
            trigger={props.trigger}
        >
            <Modal.Header>{t('Create Invoice')}</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Label>{t('Invoice Number')}:</Label>
                        <Input
                            type="text"
                            name="invoiceNumber"
                            onChange={handleFormChange}
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
                            onChange={handleFormChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Date of Service')}:</Label>
                        <Input
                            type="date"
                            name="invoiceDate"
                            onChange={handleFormChange}
                        />
                    </Form.Field>
                    <Divider hidden />
                    <CreateInvoiceModalTable
                        t={t}
                        invoiceServices={items}
                        businessInfo={props.businessInfo}
                        updateInvoiceService={(idx, newInvoiceService) => handleInvoiceServiceChange(idx, newInvoiceService)}
                        deleteInvoiceService={(idx) => deleteInvoiceServiceHandler(idx)}
                        addInvoiceService={(newInvoiceService) => addInvoiceServiceHandler(newInvoiceService)}
                    />
                    <Form.Field>
                        <Label>{t('Memo')}:</Label>
                        <Input
                            type="text"
                            name="memo"
                            onChange={handleFormChange}
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button 
                    color='black' 
                    onClick={() => setModalOpen(false)}
                >
                    {t('Cancel')}
                </Button>
                <Button 
                    onClick={() => {
                        const formParams = getFormParams();
                        props.onSubmit(formParams);
                        setModalOpen(false);
                    }}
                    disabled={!isFormValid()}
                    positive
                >
                        {t('Ok')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};