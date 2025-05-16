import React, { useState } from 'react';
import { Modal, Button, Dropdown, Form, Label, Input } from 'semantic-ui-react';
import { fuseDateTime } from '../../../../utils/helpers';
import useLocalization from '../../../../hooks/useLocalization';
import { WaveCustomer } from '@/types/waveCustomer';

type CreateScheduledCustomerModalProps = {
  datesOfService: string[];
  allCustomers: WaveCustomer[];
  onSubmit: (
    dateOfService: string,
    customerId: string,
    serviceStartTime: Date,
    serviceEndTime: Date,
  ) => void;
};

export default function CreateScheduledCustomerModal(props: CreateScheduledCustomerModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [state, setState] = useState({
    dateOfServiceValid: false,
    customerValid: false,
    timesValid: false,
    customerId: '',
    dateOfService: '',
  });
  const { t } = useLocalization();

  const getFormParams = () => {
    const dateOfService = state.dateOfService;
    const customerId = state.customerId;

    const serviceStartTimeElement = document.getElementById(
      'CreateScheduledCustomerModal_serviceStartTime',
    ) as HTMLInputElement;
    const startTime = serviceStartTimeElement.value;

    const serviceEndTimeElement = document.getElementById(
      'CreateScheduledCustomerModal_serviceEndTime',
    ) as HTMLInputElement;
    const endTime = serviceEndTimeElement.value;

    return {
      dateOfService: dateOfService,
      customerId: customerId,
      startTime: startTime,
      endTime: endTime,
    };
  };

  const handleDateOfServiceInputChange = (value: string) => {
    setState({
      ...state,
      dateOfService: value,
      dateOfServiceValid: value !== '',
    });
  };

  const handleCustomerInputChange = (value: string) => {
    setState({
      ...state,
      customerId: value,
      customerValid: value !== '',
    });
  };

  const handleTimeInputChange = () => {
    const { startTime, endTime } = getFormParams();

    setState({
      ...state,
      timesValid: !!startTime && !!endTime,
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

  const allCustomers = convertToDropdownOptions(props.allCustomers);
  const datesOfService = props.datesOfService.map((dateOfService) => {
    return {
      key: dateOfService,
      value: dateOfService,
      text: dateOfService,
    };
  });

  return (
    <Modal
      onClose={() => {
        setModalOpen(false);
        setState({
          ...state,
          customerValid: false,
          timesValid: false,
        });
      }}
      onOpen={() => {
        setModalOpen(true);
        setState({
          ...state,
          customerValid: false,
          timesValid: false,
        });
      }}
      open={modalOpen}
      trigger={<Button>{t('Add Customer')}</Button>}
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
              options={datesOfService}
              className="CreateScheduledCustomerModal_dateOfService"
              onChange={(_, data) => handleDateOfServiceInputChange(data.value as string)}
            />
          </Form.Field>
          <Form.Field>
            <Label>{t('Customer')}:</Label>
            <Dropdown
              placeholder={t('Select Customer')!}
              fluid
              search
              selection
              options={allCustomers}
              className="CreateScheduledCustomerModal_customerId"
              onChange={(_, data) => handleCustomerInputChange(data.value as string)}
            />
          </Form.Field>
          <Form.Field>
            <Label htmlFor="CreateScheduledCustomerModal_serviceStartTime">
              {t('Service Start Time')}:
            </Label>
            <Input
              type="time"
              id="CreateScheduledCustomerModal_serviceStartTime"
              name="CreateScheduledCustomerModal_serviceStartTime"
              min="00:00"
              max="24:00"
              required
              onChange={() => handleTimeInputChange()}
            />
          </Form.Field>
          <Form.Field>
            <Label htmlFor="CreateScheduledCustomerModal_serviceEndTime">
              {t('Service End Time')}:
            </Label>
            <Input
              type="time"
              id="CreateScheduledCustomerModal_serviceEndTime"
              name="CreateScheduledCustomerModal_serviceEndTime"
              min="00:00"
              max="24:00"
              required
              onChange={() => handleTimeInputChange()}
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
            const formParams = getFormParams();
            const dateOfService = formParams.dateOfService;

            props.onSubmit(
              dateOfService,
              formParams.customerId,
              fuseDateTime(dateOfService, formParams.startTime),
              fuseDateTime(dateOfService, formParams.endTime),
            );
            setModalOpen(false);
          }}
          positive
          disabled={
            !(
              state.dateOfServiceValid &&
              state.customerValid &&
              state.timesValid
            )
          }
        >
          {t('Ok')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
