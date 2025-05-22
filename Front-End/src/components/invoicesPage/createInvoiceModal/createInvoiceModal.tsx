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
import useLocalization from '../../../hooks/useLocalization';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { fetchAllCustomers } from '@/utils/helpers';
import { WaveCustomer } from '@/types/waveCustomer';
import { EventListenerNames } from '@/utils/consts';
import { useCreateInvoiceForm } from './useCreateInvoiceForm';
import { InvoiceItemsForm } from '../invoicesTable/editInvoiceModal/invoiceItemsForm';
import { WaveInvoiceCreateInput } from '@/types/waveInvoice';
import { WaveAPIClient } from '@/api/waveApiClient';

type CreateInvoiceModalProps = {
    onClose: () => void;
};

export function CreateInvoiceModal(props: CreateInvoiceModalProps) {
    const loginSession = useContext(LoginSessionContext);
    const userInfo = loginSession.userInfo!;
    const businessInfo = loginSession.businessInfo!;

    const { invoiceParams, setInvoiceParam, invoiceServices, setInvoiceServices } = useCreateInvoiceForm();
    const { t } = useLocalization();

    const { data, loading } = useDataFetcher<WaveCustomer[]>({ fetcher: () => fetchAllCustomers(businessInfo.businessId, userInfo.token) });
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
        const OPTIONAL_FIELDS = ['memo'];

        return Object.entries(formParams).reduce((acc, entry) => {
            const key = entry[0] as keyof WaveInvoiceCreateInput;
            const value = entry[1];

            if (OPTIONAL_FIELDS.includes(key)) {
                return acc && true;
            }

            if (key === 'items') {
                return acc && formParams[key].length > 0;
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
        return WaveAPIClient.createInvoice(formParams, userInfo.token);
    };

    const customerOptions = customers.map(customer => {
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
            <Modal.Header>{t('Create Invoice')}</Modal.Header>
            <Modal.Content>
                <Form>
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
                    <InvoiceItemsForm
                        invoiceServices={invoiceServices}
                        onChange={setInvoiceServices}
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
