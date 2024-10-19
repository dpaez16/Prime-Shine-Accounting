import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  Input,
  Dropdown,
  Divider,
  Pagination,
  Button,
  Message,
} from 'semantic-ui-react';
import WaveAPIClient from '../../api/waveApiClient';
import InvoicesTable from './invoicesTable/invoicesTable';
import { CreateInvoiceModal } from './createInvoiceModal/createInvoiceModal';
import { fetchAllCustomers } from '../../utils/helpers';
import useLocalization from '../../hooks/useLocalization';
import { v4 as uuidV4 } from 'uuid';
import './invoicesPage.css';
import { BusinessInfo } from '@/types/businessInfo';
import { WaveInvoice } from '@/types/waveInvoice';
import { WaveCustomer } from '@/types/waveCustomer';
import { WavePageInfo } from '@/types/wavePageInfo';

type InvoicesPageProps = {
  businessInfo: BusinessInfo;
};

type FilterParameters = { [key: string]: string | null};

export default function InvoicesPage(props: InvoicesPageProps) {
  const [state, setState] = useState({
    loading: true,
    pageNum: 1,
    filterParameters: {} as FilterParameters,
    customers: [] as WaveCustomer[],
    invoices: [] as WaveInvoice[],
    pageInfo: null as WavePageInfo | null,
    error: '',
  });

  const { t } = useLocalization();

  const fetchAllWaveDataHelper = async () => {
    const businessId = props.businessInfo.businessId;
    const pageNum = state.pageNum;
    const filterParameters = Object.keys(state.filterParameters).reduce(
      (filtered, key) => {
        if (state.filterParameters[key] !== '') {
          filtered[key] = state.filterParameters[key];
        }

        return filtered;
      },
      {} as FilterParameters,
    );

    const customers = await fetchAllCustomers(businessId);
    const { pageInfo, invoices } = await WaveAPIClient.fetchInvoices(
      businessId,
      pageNum,
      filterParameters,
    );

    return {
      customers,
      invoices,
      pageInfo,
    };
  };

  const attachInvoiceUUIDS = (invoices: WaveInvoice[]) => {
    return invoices.map((invoice) => {
      const newItems = invoice.items.map((item) => {
        return {
          ...item,
          uuid: uuidV4(),
        };
      });

      return {
        ...invoice,
        items: newItems,
      };
    });
  };

  const fetchAllWaveData = () => {
    fetchAllWaveDataHelper()
      .then(({ customers, invoices, pageInfo }) => {
        setState({
          ...state,
          loading: false,
          customers: customers,
          invoices: attachInvoiceUUIDS(invoices),
          pageInfo: pageInfo,
          error: '',
        });
      })
      .catch((err) => {
        setState({
          ...state,
          loading: false,
          error: err.message,
        });
      });
  };

  const handleFilterChange = (event, { name, value }) => {
    const filterValue = value && value.length > 0 ? value : null;
    const newFilterParameters = {
      ...state.filterParameters,
      [name]: filterValue,
    };

    setState({
      ...state,
      filterParameters: newFilterParameters,
    });
  };

  const searchHandler = (pageNum = 1) => {
    const businessId = props.businessInfo.businessId;

    WaveAPIClient.fetchInvoices(businessId, pageNum, state.filterParameters)
      .then(({ invoices, pageInfo }) => {
        setState({
          ...state,
          invoices: invoices,
          pageInfo: pageInfo,
          loading: false,
          error: '',
        });
      })
      .catch((err) => {
        setState({
          ...state,
          loading: false,
          error: err.message,
        });
      });
  };

  const handlePageChange = (event, { activePage }) => {
    setState({
      ...state,
      pageNum: activePage,
      loading: true,
      error: '',
    });

    searchHandler(activePage);
  };

  const createInvoiceHandler = (invoiceCreateData) => {
    const businessId = props.businessInfo.businessId;
    WaveAPIClient.createInvoice({
      ...invoiceCreateData,
      businessId: businessId,
    })
      .then(() => {
        setState({
          ...state,
          loading: true,
        });
        searchHandler(state.pageNum);
      })
      .catch((err) => {
        setState({
          ...state,
          error: err.message,
        });
      });
  };

  const editInvoiceHandler = (invoicePatchData) => {
    WaveAPIClient.editInvoice(invoicePatchData)
      .then((newInvoice) => {
        const newInvoices = [...state.invoices];
        const idx = newInvoices.findIndex(
          (invoice) => invoice.id === newInvoice.id,
        );
        newInvoices.splice(idx, 1, newInvoice);

        setState({
          ...state,
          invoices: newInvoices,
          error: '',
        });
      })
      .catch((err) => {
        setState({
          ...state,
          error: err.message,
        });
      });
  };

  const deleteInvoiceHandler = (invoiceId) => {
    WaveAPIClient.deleteInvoice(invoiceId)
      .then((didSucceed) => {
        console.log(didSucceed);

        const newInvoices = [...state.invoices];
        const idx = newInvoices.findIndex(
          (invoice) => invoice.id === invoiceId,
        );
        newInvoices.splice(idx, 1);

        setState({
          ...state,
          invoices: newInvoices,
          error: '',
        });
      })
      .catch((err) => {
        setState({
          ...state,
          error: err.message,
        });
      });
  };

  useEffect(() => {
    fetchAllWaveData();
  }, []);

  const customerOptions = state.customers.map((customer) => {
    return {
      key: customer.id,
      value: customer.id,
      text: customer.name,
    };
  });

  const invoiceStatusOptions = WaveAPIClient.WAVE_INVOICE_STATUSES.map(
    (waveStatus) => {
      return {
        key: waveStatus,
        value: waveStatus.toUpperCase(),
        text: waveStatus,
      };
    },
  );

  return (
    <Container fluid className="InvoicesPage">
      <Header as="h1">{t('Invoices')}</Header>
      <CreateInvoiceModal
        customerOptions={customerOptions}
        businessInfo={props.businessInfo}
        trigger={<Button>{t('Create Invoice')}</Button>}
        onSubmit={(formParams) => {
          createInvoiceHandler(formParams);
        }}
      />
      <Container className="InvoicesPage_filters" fluid textAlign="center">
        <Dropdown
          placeholder={t('All customers')!}
          selection
          search
          clearable
          options={customerOptions}
          name="customerId"
          onChange={handleFilterChange}
        />
        <Dropdown
          placeholder={t('All statuses')!}
          selection
          clearable
          options={invoiceStatusOptions}
          name="status"
          onChange={handleFilterChange}
        />
        <Input
          type="date"
          placeholder="From"
          name="invoiceDateStart"
          onChange={handleFilterChange}
        />
        <Input
          type="date"
          placeholder="To"
          name="invoiceDateEnd"
          onChange={handleFilterChange}
        />
        <Input
          type="text"
          placeholder={t('Invoice #')}
          name="invoiceNumber"
          onChange={handleFilterChange}
        />
        <Button
          color="green"
          onClick={(e) => {
            e.preventDefault();

            setState({
              ...state,
              loading: true,
            });
            searchHandler();
          }}
        >
          {t('Search')}
        </Button>
      </Container>
      <Divider hidden />
      {state.error && <Message negative content={state.error} />}
      {!state.error && (
        <InvoicesTable
          loading={state.loading}
          invoices={state.invoices}
          customers={state.customers}
          businessInfo={props.businessInfo}
          deleteInvoice={(invoiceId) => {
            deleteInvoiceHandler(invoiceId);
          }}
          editInvoice={(invoicePatchData) => {
            editInvoiceHandler(invoicePatchData);
          }}
        />
      )}
      {state.pageInfo && (
        <Pagination
          boundaryRange={0}
          activePage={state.pageNum}
          ellipsisItem={null}
          firstItem={null}
          lastItem={null}
          siblingRange={1}
          totalPages={state.pageInfo.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </Container>
  );
}
