import React, { useContext } from 'react';
import { Modal, Button, Dropdown, Form, Label, Input, InputOnChangeData } from 'semantic-ui-react';
import { fetchAllCustomers, fuseDateTime } from '../../../../utils/helpers';
import useLocalization from '../../../../hooks/useLocalization';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useCreateScheduledCustomerForm } from './useCreateScheduledCustomerForm';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import { ScheduleID } from '@/types/schedule';

type CreateScheduledCustomerModalProps = {
    datesOfService: string[];
    scheduleID: ScheduleID;
    onClose: () => void;
    onSubmit: () => void;
};

export default function CreateScheduledCustomerModal(props: CreateScheduledCustomerModalProps) {
    const context = useContext(LoginSessionContext);
    const businessInfo = context.businessInfo!;
    const userInfo = context.userInfo!;

    const { formParams, setFormParam, formValid } = useCreateScheduledCustomerForm();

    const { t } = useLocalization();
    const { data, loading } = useDataFetcher({ fetcher: () => fetchAllCustomers(businessInfo.businessId, userInfo.token) })

    const allCustomers = data ?? [];
    const customerOptions = allCustomers.map(customer => {
        return {
            key: customer.id,
            text: customer.name,
            value: customer.id,
        };
    });

    const dateOptions = props.datesOfService.map((date, idx) => {
        return {
            key: date,
            text: date,
            value: idx.toString(),
        };
    });

    const handleTimeInputChange = (
        _: React.ChangeEvent<HTMLInputElement>,
        data: InputOnChangeData,
    ) => {
        const name = data.name;
        const value = data.value;

        const dateOfService = props.datesOfService[formParams.dayOffset];
        const date = fuseDateTime(dateOfService, value);
        setFormParam(name, date.toUTCString());
    };

    const handleSubmit = () => {
        const startTime = new Date(formParams.startTime);
        const endTime = new Date(formParams.endTime);

        PrimeShineAPIClient.createScheduledCustomer(
            formParams.waveCustomerID,
            startTime,
            endTime,
            formParams.dayOffset,
            props.scheduleID,
            userInfo.token,
        )
            .then(() => props.onSubmit())
            .catch((err) => alert('Failed to create scheduled customer' + err.message)) // TODO: use translation hook
    };

    return (
        <Modal
            onClose={() => props.onClose()}
            open={true}
        >
            <Modal.Header>{t('Add Customer')}</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Label>{t('Date of Service')}:</Label>
                        <Dropdown
                            placeholder={t('Select Date')!}
                            fluid
                            selection
                            options={dateOptions}
                            onChange={(_, data) => setFormParam('dayOffset', parseInt(data.value as string))}
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
                            loading={loading}
                            onChange={(_, data) => setFormParam('waveCustomerID', data.value as string)}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Service Start Time')}:</Label>
                        <Input
                            type="time"
                            name="startTime"
                            min="00:00"
                            max="24:00"
                            required
                            onChange={handleTimeInputChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Service End Time')}:</Label>
                        <Input
                            type="time"
                            name="endTime"
                            min="00:00"
                            max="24:00"
                            required
                            onChange={handleTimeInputChange}
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color="black" onClick={() => props.onClose()}>
                    {t('Cancel')}
                </Button>
                <Button
                    onClick={() => handleSubmit()}
                    positive
                    disabled={!formValid || loading}
                >
                    {t('Ok')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}
