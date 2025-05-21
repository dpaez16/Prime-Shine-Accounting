import React, { useContext, useState } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import useLocalization from '../../../../hooks/useLocalization';
import { WaveInvoice } from '@/types/waveInvoice';
import { constructDate, dateToStr } from '@/utils/helpers';
import { EventListenerNames } from '@/utils/consts';
import { WaveAPIClient2 } from '@/api/waveApiClient2';
import { LoginSessionContext } from '@/context/LoginSessionContext';

type DeleteInvoiceModalProps = {
  trigger: React.ReactElement;
  invoice: WaveInvoice;
};

export default function DeleteInvoiceModal(props: DeleteInvoiceModalProps) {
  const loginSession = useContext(LoginSessionContext);
  const userInfo = loginSession.userInfo!;

  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useLocalization();

  const { invoice } = props;
  const invoiceDate = constructDate(invoice.invoiceDate);

  const onSubmit = () => {
    return WaveAPIClient2.deleteInvoice(invoice.id, userInfo.token);
  };

  return (
    <Modal
      onClose={() => setModalOpen(false)}
      onOpen={() => setModalOpen(true)}
      open={modalOpen}
      trigger={props.trigger}
    >
      <Modal.Header>{t('Delete Invoice?')}</Modal.Header>
      <Modal.Content>
        <div>
          <p>
            {t('Invoice Number')}: {invoice.invoiceNumber}
          </p>
          <p>
            {t('Date of Service')}: {dateToStr(invoiceDate)}
          </p>
          <p>
            {t('Customer')}: {invoice.customer.name}
          </p>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setModalOpen(false)}>
          {t('Cancel')}
        </Button>
        <Button
          onClick={() => {
            onSubmit()
              .then(() => {
                window.dispatchEvent(new Event(EventListenerNames.mutateInvoice));
                setModalOpen(false);
              })
              .catch(err => alert('Error deleting invoice: ' + err.message)); // TODO: use translation hook
          }}
          negative
        >
          {t('Ok')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
