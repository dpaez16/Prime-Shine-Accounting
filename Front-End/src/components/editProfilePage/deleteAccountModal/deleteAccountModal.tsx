import React, { useState } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import useLocalization from '../../../hooks/useLocalization';

type DeleteAccountModalProps = {
    trigger: React.ReactElement;
    onSubmit: () => void;
};

export default function DeleteAccountModal(props: DeleteAccountModalProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const { t } = useLocalization();

    return (
        <Modal
            onClose={() => setModalOpen(false)}
            onOpen={() => setModalOpen(true)}
            open={modalOpen}
            trigger={props.trigger}
        >
            <Modal.Header>{t('Delete Account')}</Modal.Header>
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
                    {t('Ok')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}
