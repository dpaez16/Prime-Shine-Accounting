import React, { useContext } from 'react';
import {
  Modal,
  Button,
  Form,
  Label,
  Input,
  Divider,
  Dropdown,
  InputOnChangeData,
  DropdownProps,
} from 'semantic-ui-react';
import useLocalization from '../../../../hooks/useLocalization';
import { WaveInvoice, WaveInvoicePatchInput } from '@/types/waveInvoice';
import { WaveCustomer } from '@/types/waveCustomer';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { EventListenerNames } from '@/utils/consts';
import { WaveAPIClient } from '@/api/waveApiClient';
import { useEditInvoiceForm } from './useEditInvoiceForm';
import { InvoiceItemsForm } from './invoiceItemsForm';

type EditInvoiceModalProps = {
  invoice: WaveInvoice;
  onClose: () => void;
};

export default function EditInvoiceModal(props: EditInvoiceModalProps) {
    const loginSession = useContext(LoginSessionContext);
    const userInfo = loginSession.userInfo!;
    const businessInfo = loginSession.businessInfo!;

    const { data, loading } = useDataFetcher<WaveCustomer[]>({ fetcher: () => WaveAPIClient.fetchAllCustomers(businessInfo.businessId, userInfo.token) });
    const { invoiceParams, setInvoiceParam, invoiceServices, setInvoiceServices } = useEditInvoiceForm(props.invoice);

    const { t } = useLocalization();

    const customers = data ?? [];

    const getFormParams = () => {
        const sanitizedInvoiceServices = invoiceServices.map(item => ({
            ...item,
            uuid: undefined,
        }));

        return {
            ...invoiceParams,
            items: sanitizedInvoiceServices,
        };
    };

    const isFormValid = () => {
        const formParams = getFormParams();
        const OPTIONAL_FIELDS: (keyof WaveInvoicePatchInput)[] = ['memo'];

        return Object.entries(formParams).reduce((acc, entry) => {
            const key = entry[0] as keyof WaveInvoicePatchInput;
            const value = entry[1];

            if (OPTIONAL_FIELDS.includes(key)) {
                return acc && true;
            }

            if (key === 'items') {
                return acc && value.length > 0;
            }

            return acc && value !== '';
        }, true);
    };

    const handleFormChange = (data: InputOnChangeData | DropdownProps) => {
        const { name, value } = data;
        setInvoiceParam(name, value);
    };

    const onSubmit = () => {
        const formParams = getFormParams();
        return WaveAPIClient.editInvoice(formParams, userInfo.token);
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
                        <div className='flex flex-row gap-2'>
                            <p>{t('Invoice Number')}:</p>
                            <p>{invoice.invoiceNumber}</p>
                        </div>
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
                    <InvoiceItemsForm
                        invoiceServices={invoiceServices}
                        onChange={setInvoiceServices}
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
