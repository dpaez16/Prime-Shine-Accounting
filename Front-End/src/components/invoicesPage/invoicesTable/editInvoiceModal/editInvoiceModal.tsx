import React, { useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Label,
  Input,
  Divider,
  Table,
  Dropdown,
  Icon,
  InputOnChangeData,
  DropdownProps,
} from 'semantic-ui-react';
import useLocalization from '../../../../hooks/useLocalization';
import { v4 as uuidV4 } from 'uuid';
import { WaveInvoice, WaveInvoiceItem } from '@/types/waveInvoice';
import { WaveCustomer } from '@/types/waveCustomer';
import { BusinessInfo } from '@/types/businessInfo';
import { InvoiceItem, InvoiceParams } from '../../createInvoiceModal/createInvoiceModal';

type EditInvoiceModalTableProps = {
  businessInfo: BusinessInfo;
  invoiceServices: WaveInvoiceItem[];
  updateInvoiceService: (idx: number, invoiceItem: WaveInvoiceItem) => void;
  deleteInvoiceService: (idx: number) => void;
  addInvoiceService: (invoiceItem: WaveInvoiceItem) => void;
};

function EditInvoiceModalTable(props: EditInvoiceModalTableProps) {
  const createNewInvoiceService = () => {
    const { productId, productName } = props.businessInfo;

    return {
      product: {
        id: productId,
        name: productName,
      },
      description: '',
      total: {
        value: 0,
      },
      uuid: uuidV4(),
    };
  };

  const { t } = useLocalization();
  const { invoiceServices } = props;

  return (
    <Table celled className="EditInvoiceModal_table">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{t('Items')}</Table.HeaderCell>
          <Table.HeaderCell>{t('Description')}</Table.HeaderCell>
          <Table.HeaderCell>{t('Price')}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {invoiceServices.map((invoiceService, index) => {
          return (
            <Table.Row key={invoiceService.uuid}>
              <Table.Cell>{invoiceService.product.name}</Table.Cell>
              <Table.Cell>
                <Input
                  type="text"
                  defaultValue={invoiceService.description}
                  onChange={(e) => {
                    const description = e.target.value;
                    const newInvoiceService = {
                      ...invoiceService,
                      description: description,
                    };
                    props.updateInvoiceService(index, newInvoiceService);
                  }}
                />
              </Table.Cell>
              <Table.Cell>
                <Input
                  type="text"
                  defaultValue={invoiceService.total.value}
                  onChange={(e) => {
                    const totalValue = e.target.value;
                    const newInvoiceService = {
                      ...invoiceService,
                      total: { value: totalValue },
                    };
                    props.updateInvoiceService(index, newInvoiceService);
                  }}
                />
                <Icon
                  name="trash"
                  link={true}
                  onClick={() => {
                    props.deleteInvoiceService(index);
                  }}
                />
              </Table.Cell>
            </Table.Row>
          );
        })}
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
}

type EditInvoiceModalProps = {
  trigger: React.ReactElement;
  invoice: WaveInvoice;
  customers: WaveCustomer[];
  businessInfo: BusinessInfo;
  onSubmit: (invoiceParams: InvoiceParams) => void;
};

export default function EditInvoiceModal(props: EditInvoiceModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [invoiceServices, setInvoiceServices] = useState([] as WaveInvoiceItem[]);
  const [invoiceParams, setInvoiceParams] = useState({} as InvoiceParams);
  const { t } = useLocalization();

  const getFormParams = () => {
    const formParams = {
      ...props.invoice,
      ...invoiceParams,
      invoiceServices: invoiceServices,
    };

    return {
      id: formParams.id,
      customerId: formParams.customer.id,
      invoiceDate: formParams.invoiceDate,
      items: formParams.invoiceServices.map((invoiceService) => {
        return {
          productId: invoiceService.product.id,
          description: invoiceService.description,
          quantity: 1,
          unitPrice: invoiceService.total.value,
        } as InvoiceItem;
      }),
      memo: formParams.memo,
    } as InvoiceParams;
  };

  const isFormValid = () => {
    const formParams = getFormParams();
    const OPTIONAL_FIELDS = ['memo'];

    return Object.keys(formParams).reduce((acc, key) => {
      if (OPTIONAL_FIELDS.includes(key)) {
        return acc && true;
      }

      if (key === 'items') {
        return acc && formParams[key].length > 0;
      }

      return acc && formParams[key as keyof InvoiceParams] !== '';
    }, true);
  };

  const handleFormChange = (data: InputOnChangeData | DropdownProps) => {
    const { name, value } = data;
    setInvoiceParams({
      ...invoiceParams,
      [name]: value,
    });
  };

  const handleInvoiceServiceChange = (idx: number, newInvoiceService: WaveInvoiceItem) => {
    const newInvoiceServices = [...invoiceServices];
    newInvoiceServices.splice(idx, 1, newInvoiceService);

    setInvoiceServices(newInvoiceServices);
  };

  const deleteInvoiceServiceHandler = (idx: number) => {
    const newInvoiceServices = invoiceServices.filter(
      (_, elementIdx) => idx !== elementIdx,
    );
    setInvoiceServices(newInvoiceServices);
  };

  const addInvoiceServiceHandler = (newInvoiceService: WaveInvoiceItem) => {
    const newInvoiceServices = [...invoiceServices, newInvoiceService];
    setInvoiceServices(newInvoiceServices);
  };

  const { invoice } = props;
  const customerOptions = props.customers.map((customer) => {
    return {
      key: customer.id,
      value: customer.id,
      text: customer.name,
    };
  });

  return (
    <Modal
      onClose={() => {
        setModalOpen(false);
        setInvoiceServices([...props.invoice.items]);
      }}
      onOpen={() => {
        setModalOpen(true);
        setInvoiceServices([...props.invoice.items]);
      }}
      open={modalOpen}
      trigger={props.trigger}
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
              onChange={(_, data) => handleFormChange(data)}
            />
          </Form.Field>
          <Form.Field>
            <Label>{t('Customer')}:</Label>
            <Dropdown
              placeholder={t('Select Customer')!}
              fluid
              search
              selection
              options={customerOptions}
              name="customerId"
              defaultValue={invoice.customer.id}
              onChange={(_, data) => handleFormChange(data)}
            />
          </Form.Field>
          <Form.Field>
            <Label>{t('Date of Service')}:</Label>
            <Input
              type="date"
              name="invoiceDate"
              defaultValue={invoice.invoiceDate}
              onChange={(_, data) => handleFormChange(data)}
            />
          </Form.Field>
          <Divider hidden />
          <EditInvoiceModalTable
            invoiceServices={invoiceServices}
            businessInfo={props.businessInfo}
            updateInvoiceService={(idx, newInvoiceService) =>
              handleInvoiceServiceChange(idx, newInvoiceService)
            }
            deleteInvoiceService={(idx) => deleteInvoiceServiceHandler(idx)}
            addInvoiceService={(newInvoiceService) =>
              addInvoiceServiceHandler(newInvoiceService)
            }
          />
          <Form.Field>
            <Label>{t('Memo')}:</Label>
            <Input
              type="text"
              defaultValue={invoice.memo}
              name="memo"
              onChange={(_, data) => handleFormChange(data)}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setModalOpen(false)}>
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
}
