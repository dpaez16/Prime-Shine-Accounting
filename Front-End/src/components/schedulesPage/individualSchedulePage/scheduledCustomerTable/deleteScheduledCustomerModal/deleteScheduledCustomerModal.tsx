import React, { useContext, useState } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import useLocalization from '../../../../../hooks/useLocalization';
import { FullScheduledCustomer } from '@/types/scheduledCustomer';
import { constructTimeStr } from '@/utils/helpers';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';

type DeleteScheduledCustomerModalProps = {
    scheduledCustomer: FullScheduledCustomer;
    onSubmit: () => void;
    onClose: () => void;
};

export const DeleteScheduledCustomerModal: React.FC<DeleteScheduledCustomerModalProps> = (props) => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;

    const { t } = useLocalization();
    const customer = props.scheduledCustomer;

    const handleSubmit = () => {
        PrimeShineAPIClient.deleteScheduledCustomer(
            customer.scheduledCustomerID,
            userInfo.token,
        )
            .then(() => props.onSubmit())
            .catch((err) => alert('Failed to delete scheduled customer: ' + err.message)); // TODO: use translation hook
    };

    return (
        <Modal
            onClose={() => props.onClose()}
            open={true}
        >
            <Modal.Header>{t('Delete Customer?')}</Modal.Header>
            <Modal.Content>
                <p>{t('Customer')}: {customer.metadata.name}</p>
                <p>{t('Service Start Time')}: {constructTimeStr(customer.startTime)}</p>
                <p>{t('Service End Time')}: {constructTimeStr(customer.endTime)}</p>
            </Modal.Content>
            <Modal.Actions>
                <Button color="black" onClick={() => props.onClose()}>
                    {t('Cancel')}
                </Button>
                <Button
                    onClick={() => handleSubmit()}
                    negative
                >
                    {t('Ok')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}
