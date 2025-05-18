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
import useLocalization from '../../../hooks/useLocalization';
import { v4 as uuidV4 } from 'uuid';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { fetchAllCustomers } from '@/utils/helpers';
import { WaveCustomer } from '@/types/waveCustomer';
import WaveAPIClient from '@/api/waveApiClient';
import { EventListenerNames } from '@/utils/consts';

export type InvoiceItem = {
  description: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  uuid: string;
};

type CreateInvoiceModalTableProps = {
  invoiceServices: InvoiceItem[];
  updateInvoiceService: (idx: number, invoiceService: InvoiceItem) => void;
  deleteInvoiceService: (idx: number) => void;
  addInvoiceService: (invoiceService: InvoiceItem) => void;
};

function CreateInvoiceModalTable(props: CreateInvoiceModalTableProps) {
  const context = useContext(LoginSessionContext);
  const businessInfo = context.businessInfo!;

  const createNewInvoiceService = () => {
    const { productId } = businessInfo;

    return {
      productId: productId,
      description: '',
      quantity: 1,
      unitPrice: 0,
      uuid: uuidV4(),
    };
  };

  const { t } = useLocalization();
  const { invoiceServices } = props;
  const productName = businessInfo.productName;

  return (
    <Table celled className="CreateInvoiceModal_table">
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
              <Table.Cell>{productName}</Table.Cell>
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
                  defaultValue={invoiceService.unitPrice}
                  onChange={(e) => {
                    const totalValue = e.target.value;
                    const newInvoiceService = {
                      ...invoiceService,
                      unitPrice: totalValue,
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

export type InvoiceParams = {
  invoiceNumber?: string;
  customerId: string;
  invoiceDate: string;
  memo: string;
  items: InvoiceItem[];
};

type CreateInvoiceModalProps = {
  onClose: () => void;
};

export function CreateInvoiceModal(props: CreateInvoiceModalProps) {
  const loginSession = useContext(LoginSessionContext);
  const userInfo = loginSession.userInfo!;
  const businessInfo = loginSession.businessInfo!;

  const [items, setItems] = useState([] as InvoiceItem[]);
  const [invoiceParams, setInvoiceParams] = useState<InvoiceParams>({
      invoiceNumber: '',
      customerId: '',
      invoiceDate: '',
      items: [],
      memo: '',
  });
  const { t } = useLocalization();

  const { data: customers, loading } = useDataFetcher<WaveCustomer[]>({ fetcher: () => fetchAllCustomers(businessInfo.businessId, userInfo.token) });

  const getFormParams = () => {
    return {
      ...invoiceParams,
      items: items,
    };
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

  const handleInvoiceServiceChange = (idx: number, newInvoiceService: InvoiceItem) => {
    const newInvoiceServices = [...items];
    newInvoiceServices.splice(idx, 1, newInvoiceService);
    setItems(newInvoiceServices);
  };

  const deleteInvoiceServiceHandler = (idx: number) => {
    const newInvoiceServices = items.filter(
      (_, elementIdx) => idx !== elementIdx,
    );
    setItems(newInvoiceServices);
  };

  const addInvoiceServiceHandler = (newInvoiceService: InvoiceItem) => {
    const newInvoiceServices = [...items, newInvoiceService];
    setItems(newInvoiceServices);
  };

  const onSubmit = () => {
    const businessId = businessInfo.businessId;
    const formParams = getFormParams();

    return WaveAPIClient.createInvoice({
      ...formParams,
      businessId: businessId,
    });
  };

  const customerOptions = customers?.map(customer => {
    return {
      key: customer.id,
      value: customer.id,
      text: customer.name,
    };
  }) ?? [];

  return (
    <Modal
      onClose={() => props.onClose()}
      open={true}
    >
      <Modal.Header>{t('Create Invoice')}</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <Label>{t('Invoice Number')}:</Label>
            <Input
              type="text"
              name="invoiceNumber"
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
              onChange={(_, data) => handleFormChange(data)}
            />
          </Form.Field>
          <Form.Field>
            <Label>{t('Date of Service')}:</Label>
            <Input type="date" name="invoiceDate" onChange={(_, data) => handleFormChange(data)} />
          </Form.Field>
          <Divider hidden />
          <CreateInvoiceModalTable
            invoiceServices={items}
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
            <Input type="text" name="memo" onChange={(_, data) => handleFormChange(data)} />
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
              .catch(err => alert('Error creating invoice: ' + err.message)); // TODO: use translation hook
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
