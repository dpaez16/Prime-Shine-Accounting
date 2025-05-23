import React, { useState } from 'react';
import { Modal, Button, Dropdown, Form, Label, Input } from 'semantic-ui-react';
import {
  fuseDateTime,
  constructMilitaryTimeStr,
} from '../../../../../utils/helpers';
import useLocalization from '../../../../../hooks/useLocalization';
import { ScheduledCustomer } from '@/types/scheduledCustomer';
import { WaveCustomer } from '@/types/waveCustomer';

type EditScheduledCustomerModalProps = {
  allCustomers: WaveCustomer[];
  scheduledCustomer: ScheduledCustomer;
  scheduleDayDate: string;
  onSubmit: (
    customerId: string,
    serviceStartTime: Date,
    serviceEndTime: Date,
  ) => void;
};

export default function EditScheduledCustomerModal(props: EditScheduledCustomerModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [formParams, setFormParams] = useState({
    customerId: props.scheduledCustomer.customerId,
    serviceStartTime: constructMilitaryTimeStr(
      props.scheduledCustomer.serviceStartTime,
    ),
    serviceEndTime: constructMilitaryTimeStr(
      props.scheduledCustomer.serviceEndTime,
    ),
  });
  const { t } = useLocalization();

  const isFormValid = () => {
    const { customerId, serviceStartTime, serviceEndTime } = formParams;

    return (
      customerId &&
      customerId !== null &&
      customerId.length > 0 &&
      serviceStartTime !== null &&
      serviceEndTime !== null
    );
  };

  const handleFormChange = (name: string, value: string) => {
    setFormParams({
      ...formParams,
      [name]: value,
    });
  };

  const convertToDropdownOptions = (items: WaveCustomer[]) => {
    return items.map((item) => {
      return {
        key: item.id,
        value: item.id,
        text: item.name,
      };
    });
  };

  const defaultServiceStartTime = constructMilitaryTimeStr(
    props.scheduledCustomer.serviceStartTime,
  );
  const defaultServiceEndTime = constructMilitaryTimeStr(
    props.scheduledCustomer.serviceEndTime,
  );

  return (
    <Modal
      onClose={() => setModalOpen(false)}
      onOpen={() => setModalOpen(true)}
      open={modalOpen}
      trigger={<Button>{t('Edit')}</Button>}
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
              options={convertToDropdownOptions(props.allCustomers)}
              name="customerId"
              onChange={(_, data) => handleFormChange(data.name, data.value as string)}
              defaultValue={props.scheduledCustomer.customerId}
            />
          </Form.Field>
          <Form.Field>
            <Label htmlFor="EditScheduledCustomerModal_serviceStartTime">
              {t('Service Start Time')}:
            </Label>
            <Input
              type="time"
              id="EditScheduledCustomerModal_serviceStartTime"
              min="00:00"
              max="24:00"
              required
              name="serviceStartTime"
              onChange={(_, data) => handleFormChange(data.name, data.value)}
              defaultValue={defaultServiceStartTime}
            />
          </Form.Field>
          <Form.Field>
            <Label htmlFor="EditScheduledCustomerModal_serviceEndTime">
              {t('Service End Time')}:
            </Label>
            <Input
              type="time"
              id="EditScheduledCustomerModal_serviceEndTime"
              min="00:00"
              max="24:00"
              required
              name="serviceEndTime"
              onChange={(_, data) => handleFormChange(data.name, data.value)}
              defaultValue={defaultServiceEndTime}
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
            const { customerId, serviceStartTime, serviceEndTime } = formParams;
            const scheduleDayDate = props.scheduleDayDate;
            props.onSubmit(
              customerId,
              fuseDateTime(scheduleDayDate, serviceStartTime),
              fuseDateTime(scheduleDayDate, serviceEndTime),
            );
            setModalOpen(false);
          }}
          positive
          disabled={!isFormValid()}
        >
          {t('Ok')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
