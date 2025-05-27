import { LoginSessionContext } from '@/context/LoginSessionContext';
import { ScheduleID } from '@/types/schedule';
import { FullScheduledCustomer } from '@/types/scheduledCustomer';
import React, { useContext } from 'react';
import { useEditScheduledCustomerForm } from './useEditScheduledCustomerForm';
import useLocalization from '@/hooks/useLocalization';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { constructMilitaryTimeStr, fuseDateTime } from '@/utils/helpers';
import { Button, Dropdown, Form, Input, InputOnChangeData, Label, Modal } from 'semantic-ui-react';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import { WaveAPIClient } from '../../../../../api/waveApiClient';

type EditScheduledCustomerModalProps = {
    dateOfService: string;
    scheduleID: ScheduleID;
    scheduledCustomer: FullScheduledCustomer;
    onClose: () => void;
    onSubmit: () => void;
};

export default function EditScheduledCustomerModal(props: EditScheduledCustomerModalProps) {
    const context = useContext(LoginSessionContext);
    const businessInfo = context.businessInfo!;
    const userInfo = context.userInfo!;

    const { formParams, setFormParam, formValid } = useEditScheduledCustomerForm(props.scheduledCustomer);

    const { t } = useLocalization();
    const { data, loading } = useDataFetcher({ fetcher: () => WaveAPIClient.fetchAllCustomers(businessInfo.businessId, userInfo.token) });

    const allCustomers = data ?? [];
    const customerOptions = allCustomers.map(customer => {
        return {
            key: customer.id,
            text: customer.name,
            value: customer.id,
        };
    });

    const handleTimeInputChange = (
        _: React.ChangeEvent<HTMLInputElement>,
        data: InputOnChangeData,
    ) => {
        const name = data.name;
        const value = data.value;

        const date = fuseDateTime(props.dateOfService, value);
        setFormParam(name, date.toUTCString());
    };

    const handleSubmit = () => {
        const startTime = new Date(formParams.startTime);
        const endTime = new Date(formParams.endTime);

        PrimeShineAPIClient.editScheduledCustomer(
            formParams.scheduledCustomerID,
            formParams.waveCustomerID,
            startTime,
            endTime,
            formParams.dayOffset,
            props.scheduleID,
            userInfo.token,
        )
            .then(() => props.onSubmit())
            .catch((err) => alert('Failed to create scheduled customer' + err.message)); // TODO: use translation hook
    };

    return (
        <Modal
            onClose={() => props.onClose()}
            open={true}
        >
            <Modal.Header>{t('Edit Scheduled Customer')}</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Label>{t('Customer')}:</Label>
                        <Dropdown
                            placeholder={t('Select Customer')!}
                            fluid
                            search
                            selection
                            options={customerOptions}
                            loading={loading}
                            value={formParams.waveCustomerID}
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
                            defaultValue={constructMilitaryTimeStr(formParams.startTime)}
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
                            defaultValue={constructMilitaryTimeStr(formParams.endTime)}
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
