import {useState} from 'react';
import {Modal, Button} from 'semantic-ui-react';
import useLocalization from '../../../hooks/useLocalization';

export default function DeleteScheduleModal(props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [t] = useLocalization();

    return (
        <Modal
            onClose={() => setModalOpen(false)}
            onOpen={() => setModalOpen(true)}
            open={modalOpen}
            trigger={<Button negative>{t('Delete')}</Button>}
        >
            <Modal.Header>{t('Delete Schedule?')}</Modal.Header>
            <Modal.Content>
                <div>
                    <p>{t('Start Day')}: {props.startDay}</p>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button 
                    color='black' 
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
};