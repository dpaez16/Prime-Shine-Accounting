import React, { useState } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import useLocalization from '../../../hooks/useLocalization';

type DeleteCustomerModalProps = {
    onSubmit: () => void;
}

export default function DeleteCustomerModal(props: DeleteCustomerModalProps) {
    const { t } = useLocalization();
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <Modal
            onClose={() => setModalOpen(false)}
            onOpen={() => setModalOpen(true)}
            open={modalOpen}
            trigger={<Button negative>{t('Delete')}</Button>}
        >
            <Modal.Header>{t('Delete Customer?')}</Modal.Header>
            <Modal.Content>{t('Are you sure?')}</Modal.Content>
            <Modal.Actions>
                <Button
                    color="black"
                    onClick={() => setModalOpen(false)}
                >
                    {t('Cancel')}
                </Button>
                <Button
                    onClick={() => {
                        props.onSubmit();
                        setModalOpen(false);
                    }}
                    negative
                >
                    {t('Delete')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}
