import React, { useState } from 'react';
import { Modal, Button, Form, Label, Input } from 'semantic-ui-react';
import { constructDate } from '../../../utils/helpers';
import useLocalization from '../../../hooks/useLocalization';

type CreateScheduleModalProps = {
  onSubmit: (startDay: Date) => void;
};

export default function CreateScheduleModal(props: CreateScheduleModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isDateValid, setIsDateValid] = useState(false);
  const { t } = useLocalization();

  const getFormParams = () => {
    const element = document.getElementById('createSchedule_startDay') as HTMLInputElement;
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
      trigger={<Button>{t('Create Schedule')}</Button>}
    >
      <Modal.Header>{t('Create Schedule')}</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <Label>{t('Start date')}:</Label>
            <Input
              type="date"
              id="createSchedule_startDay"
              min="2010-01-01"
              defaultValue=""
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
          {t('Create')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
