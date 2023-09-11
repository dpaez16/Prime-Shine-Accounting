import {useState} from 'react';
import {Modal, Button, Form, Label, Input} from 'semantic-ui-react';
import { constructDate } from '../../../utils/helpers';
import useLocalization from '../../../hooks/useLocalization';

export default function EditScheduleModal(props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [isDateValid, setIsDateValid] = useState(false);
    const [t] = useLocalization();

    const getFormParams = () => {
        const startDay = document.getElementById('editSchedule_startDay').value;

        return {
            startDay: constructDate(startDay)
        };
    };

    const handleDateChange = (event) => {
        const startDay = event.target.value;

        if (startDay) {
            setIsDateValid(true);
        }
    };

    const defaultStartDay = props.schedule.startDay.toISOString().split('T')[0];

    return (
        <Modal
            onClose={() => {
                setModalOpen(false);
                setIsDateValid(false);
            }}
            onOpen={() => {
                setModalOpen(true);
                setIsDateValid(false);
            }}
            open={modalOpen}
            trigger={<Button>{t('Edit')}</Button>}
        >
            <Modal.Header>{t('Edit Schedule')}</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Label>{t('Start date')}:</Label>
                        <Input  type="date"
                            id="editSchedule_startDay"
                            min="2010-01-01"
                            max="2023-12-31"
                            defaultValue={defaultStartDay}
                            onChange={e => handleDateChange(e)}
                        />
                    </Form.Field>
                </Form>
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
                        const { startDay } = getFormParams();
                        props.onSubmit(startDay);
                        setModalOpen(false);
                    }}
                    disabled={!isDateValid}
                    positive
                >
                        {t('Ok')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};