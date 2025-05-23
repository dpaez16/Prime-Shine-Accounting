import React, { useState } from 'react';
import { Modal, Button, Form, Label, Input } from 'semantic-ui-react';
import { constructDate } from '../../../utils/helpers';
import useLocalization from '../../../hooks/useLocalization';
import { Schedule } from '@/types/schedule';

type EditScheduleModalProps = {
  schedule: Schedule;
  onSubmit: (startDate: Date) => void;
}

export default function EditScheduleModal(props: EditScheduleModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isDateValid, setIsDateValid] = useState(false);
  const { t } = useLocalization();

  const getFormParams = () => {
    const element = document.getElementById('editSchedule_startDay') as HTMLInputElement;
    const startDay = element.value;

    return {
      startDay: constructDate(startDay),
    };
  };

  const handleDateChange = (startDay: string) => {
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
            <Input
              type="date"
              id="editSchedule_startDay"
              min="2010-01-01"
              defaultValue={defaultStartDay}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setModalOpen(false)}>
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
}
