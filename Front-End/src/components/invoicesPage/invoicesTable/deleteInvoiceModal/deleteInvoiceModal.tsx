import React, { useState } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import useLocalization from '../../../../hooks/useLocalization';
import { WaveInvoice } from '@/types/waveInvoice';

type DeleteInvoiceModalProps = {
  trigger: React.ReactElement;
  invoice: WaveInvoice;
  onSubmit: () => void;
};

export default function DeleteInvoiceModal(props: DeleteInvoiceModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useLocalization();

  const { invoice } = props;

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
            {t('Date of Service')}: {invoice.invoiceDate}
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
