import React from 'react';
import { Table, Dropdown } from 'semantic-ui-react';
import DeleteInvoiceModal from './deleteInvoiceModal/deleteInvoiceModal';
import EditInvoiceModal from './editInvoiceModal/editInvoiceModal';
import LoadingSegment from '../../loadingSegment/loadingSegment';
import useLocalization from '../../../hooks/useLocalization';
import { v4 as uuidV4 } from 'uuid';
import { WaveInvoice } from '@/types/waveInvoice';
import { BusinessInfo } from '@/types/businessInfo';
import { WaveCustomer } from '@/types/waveCustomer';
import { InvoiceParams } from '../createInvoiceModal/createInvoiceModal';

type InvoiceTableProps = {
  loading: boolean;
  invoices: WaveInvoice[];
  customers: WaveCustomer[];
  businessInfo: BusinessInfo;
  editInvoice: (data: InvoiceParams) => void;
  deleteInvoice: (id: string) => void;
};

export default function InvoicesTable(props: InvoiceTableProps) {
  const { t } = useLocalization();

  if (props.loading) {
    return <LoadingSegment className="InvoicesPage_table_loading" />;
  }

  return (
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
          return (
            <Table.Row key={uuidV4()}>
              <Table.Cell>{invoice.status}</Table.Cell>
              <Table.Cell>{invoice.invoiceDate}</Table.Cell>
              <Table.Cell>{invoice.invoiceNumber}</Table.Cell>
              <Table.Cell>{invoice.customer.name}</Table.Cell>
              <Table.Cell>${invoice.total.value}</Table.Cell>
              <Table.Cell>${invoice.amountDue.value}</Table.Cell>
              <Table.Cell>
                <Dropdown>
                  <Dropdown.Menu>
                    <EditInvoiceModal
                      trigger={<Dropdown.Item text={t('Edit')} />}
                      invoice={invoice}
                      customers={props.customers}
                      businessInfo={props.businessInfo}
                      onSubmit={(invoicePatchData: InvoiceParams) => {
                        props.editInvoice(invoicePatchData);
                      }}
                    />
                    <DeleteInvoiceModal
                      trigger={<Dropdown.Item text={t('Delete')} />}
                      invoice={invoice}
                      onSubmit={() => {
                        props.deleteInvoice(invoice.id);
                      }}
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
  );
}
