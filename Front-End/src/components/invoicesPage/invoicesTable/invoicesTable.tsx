import React, { useState } from 'react';
import { Table, Dropdown } from 'semantic-ui-react';
import { DeleteInvoiceModal } from './deleteInvoiceModal/deleteInvoiceModal';
import { EditInvoiceModal } from './editInvoiceModal/editInvoiceModal';
import { LoadingSegment } from '../../loadingSegment/loadingSegment';
import useLocalization from '../../../hooks/useLocalization';
import { WaveInvoice } from '@/types/waveInvoice';
import { constructDate, dateToStr } from '@/utils/helpers';

type InvoiceTableProps = {
  loading: boolean;
  invoices: WaveInvoice[];
};

export const InvoicesTable: React.FC<InvoiceTableProps> = (props) => {
  const [editingInvoice, setEditingInvoice] = useState<WaveInvoice | null>(null);
  const { t } = useLocalization();

  if (props.loading) {
    return <LoadingSegment />;
  }

  return (
    <>
      {
        editingInvoice &&
        <EditInvoiceModal
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
        />
      }
      <Table className="InvoicesPage_table">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t('Status')}</Table.HeaderCell>
            <Table.HeaderCell>{t('Date')}</Table.HeaderCell>
            <Table.HeaderCell>{t('Number')}</Table.HeaderCell>
            <Table.HeaderCell>{t('Customer')}</Table.HeaderCell>
            <Table.HeaderCell>{t('Total')}</Table.HeaderCell>
            <Table.HeaderCell>{t('Amount Due')}</Table.HeaderCell>
            <Table.HeaderCell>{t('Options')}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {props.invoices.map(invoice => {
            const invoiceDate = constructDate(invoice.invoiceDate);
            return (
              <Table.Row key={invoice.id}>
                <Table.Cell>{invoice.status}</Table.Cell>
                <Table.Cell>{dateToStr(invoiceDate)}</Table.Cell>
                <Table.Cell>{invoice.invoiceNumber}</Table.Cell>
                <Table.Cell>{invoice.customer.name}</Table.Cell>
                <Table.Cell>${invoice.total.value}</Table.Cell>
                <Table.Cell>${invoice.amountDue.value}</Table.Cell>
                <Table.Cell>
                  <Dropdown>
                    <Dropdown.Menu>
                      <Dropdown.Item text={t('Edit')} onClick={() => setEditingInvoice(invoice)} />
                      <DeleteInvoiceModal
                        trigger={<Dropdown.Item text={t('Delete')} />}
                        invoice={invoice}
                      />
                      <Dropdown.Item
                        text={t('Download PDF')}
                        onClick={() => {
                          const url = invoice.pdfUrl;
                          window.open(url, '_blank');
                        }}
                      />
                      <Dropdown.Item
                        text={t('View Invoice to Print')}
                        onClick={() => {
                          const url = invoice.viewUrl;
                          window.open(url, '_blank');
                        }}
                      />
                    </Dropdown.Menu>
                  </Dropdown>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
};
