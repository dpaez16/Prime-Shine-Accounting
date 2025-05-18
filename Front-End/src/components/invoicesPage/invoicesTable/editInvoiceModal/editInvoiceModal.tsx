import React, { useContext, useState } from 'react';
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
import { InvoiceItem, InvoiceParams } from '../../createInvoiceModal/createInvoiceModal';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { fetchAllCustomers } from '@/utils/helpers';
import WaveAPIClient from '@/api/waveApiClient';
import { EventListenerNames } from '@/utils/consts';

type EditInvoiceModalTableProps = {
  invoiceServices: WaveInvoiceItem[];
  updateInvoiceService: (idx: number, invoiceItem: WaveInvoiceItem) => void;
  deleteInvoiceService: (idx: number) => void;
  addInvoiceService: (invoiceItem: WaveInvoiceItem) => void;
};

function EditInvoiceModalTable(props: EditInvoiceModalTableProps) {
  const context = useContext(LoginSessionContext);
  const businessInfo = context.businessInfo!;

  const createNewInvoiceService = () => {
    const { productId, productName } = businessInfo;

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
  invoice: WaveInvoice;
  onClose: () => void;
};

export default function EditInvoiceModal(props: EditInvoiceModalProps) {
  const loginSession = useContext(LoginSessionContext);
  const userInfo = loginSession.userInfo!;
  const businessInfo = loginSession.businessInfo!;

  const [invoiceServices, setInvoiceServices] = useState(props.invoice.items);
  const [invoiceParams, setInvoiceParams] = useState<InvoiceParams>({
      invoiceNumber: props.invoice.invoiceNumber,
      customerId: props.invoice.customer.id,
      invoiceDate: props.invoice.invoiceDate,
      items: [],
      memo: props.invoice.memo,
  });

  const { t } = useLocalization();

  const { data, loading } = useDataFetcher<WaveCustomer[]>({ fetcher: () => fetchAllCustomers(businessInfo.businessId, userInfo.token) });
  const customers = data ?? [];

  const getFormParams = () => {
    return {
      id: props.invoice.id,
      customerId: invoiceParams.customerId,
      invoiceDate: invoiceParams.invoiceDate,
      items: invoiceServices.map((invoiceService) => {
        return {
          productId: invoiceService.product.id,
          description: invoiceService.description,
          quantity: 1,
          unitPrice: invoiceService.total.value,
        } as InvoiceItem;
      }),
      memo: invoiceParams.memo,
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

  const onSubmit = () => {
    const formParams = getFormParams();
    return WaveAPIClient.editInvoice(formParams);
  };

  const { invoice } = props;
  const customerOptions = customers.map((customer) => {
    return {
      key: customer.id,
      value: customer.id,
      text: customer.name,
    };
  });

  return (
    <Modal
      onClose={() => props.onClose()}
      open={true}
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
              loading={loading}
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
        <Button color="black" onClick={() => props.onClose()}>
          {t('Cancel')}
        </Button>
        <Button
          onClick={() => {
            onSubmit()
              .then(() => {
                window.dispatchEvent(new Event(EventListenerNames.mutateInvoice));
                props.onClose();
              })
              .catch(err => alert('Error editing invoice: ' + err.message)); // TODO: use translation hook
          }}
          disabled={!isFormValid() || loading}
          positive
        >
          {t('Ok')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
