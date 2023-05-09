import React, {Component} from 'react';
import {Container, Header, Input, Dropdown, Divider, Pagination, Button, Message} from 'semantic-ui-react';
import WaveAPIClient from '../../api/waveApiClient';
import InvoicesTable from './invoicesTable/invoicesTable';
import {fetchAllCustomers} from '../../utils/helpers';
import componentWrapper from '../../utils/componentWrapper';
//import './invoicesPage.css';

class InvoicesPage extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            loading: true,
            pageNum: 1,
            filterParameters: {},
            customers: [],
            invoices: [],
            pageInfo: null,
            error: null
        };
    }

    async fetchAllWaveDataHelper() {
        const businessId = this.props.businessInfo.businessId;
        const pageNum = this.state.pageNum;
        const filterParameters = Object.keys(this.state.filterParameters).reduce((filtered, key) => {
            if (this.state.filterParameters[key] !== '') {
                filtered[key] = this.state.filterParameters[key];
            }

            return filtered;
        }, {});

        const customers = await fetchAllCustomers(businessId);
        const { pageInfo, invoices } = await WaveAPIClient.fetchInvoices(businessId, pageNum, filterParameters);

        return {
            customers,
            invoices,
            pageInfo
        };
    }

    fetchAllWaveData() {
        this.fetchAllWaveDataHelper()
        .then(({customers, invoices, pageInfo}) => {
            this.setState({
                loading: false,
                customers: customers,
                invoices: invoices,
                pageInfo: pageInfo,
                error: null
            });
        })
        .catch(err => {
            this.setState({
                loading: false,
                error: err.message
            });
        });
    }

    componentDidMount() {
        this.fetchAllWaveData();
    }

    handleFilterChange(event, {name, value}) {
        const filterValue = value && value.length > 0 ? value : null;
        const newFilterParameters = {...this.state.filterParameters, [name]: filterValue};

        this.setState({
            filterParameters: newFilterParameters
        });
    }

    searchHandler() {
        const businessId = this.props.businessInfo.businessId;
        const pageNum = 1;

        WaveAPIClient.fetchInvoices(businessId, pageNum, this.state.filterParameters)
        .then(({invoices, pageInfo}) => {
            this.setState({
                invoices: invoices,
                pageInfo: pageInfo,
                loading: false,
                error: null
            });
        })
        .catch(err => {
            this.setState({
                loading: false,
                error: err.message
            });
        });
    }

    handlePageChange(event, { activePage }) {
        this.setState({
            pageNum: activePage,
            loading: true,
            error: null
        });
    }

    editInvoiceHandler(invoicePatchData) {
        WaveAPIClient.editInvoice(invoicePatchData)
        .then(newInvoice => {
            let newInvoices = [...this.state.invoices];
            const idx = newInvoices.findIndex(invoice => invoice.id === newInvoice.id);
            newInvoices.splice(idx, 1, newInvoice);

            this.setState({
                invoices: newInvoices,
                error: null
            });
        })
        .catch(err => {
            this.setState({
                error: err.message
            });
        });
    }

    deleteInvoiceHandler(invoiceId) {
        WaveAPIClient.deleteInvoice(invoiceId)
        .then(didSucceed => {
            console.log(didSucceed);

            let newInvoices = [...this.state.invoices];
            const idx = newInvoices.findIndex(invoice => invoice.id === invoiceId);
            newInvoices.splice(idx, 1);

            this.setState({
                invoices: newInvoices,
                error: null
            });
        })
        .catch(err => {
            this.setState({
                error: err.message
            });
        });
    }

    render() {
        const customerOptions = this.state.customers.map(customer => {
            return {
                key: customer.id,
                value: customer.id,
                text: customer.name
            };
        });

        const invoiceStatusOptions = WaveAPIClient.WAVE_INVOICE_STATUSES.map(waveStatus => {
            return {
                key: waveStatus,
                value: waveStatus.toUpperCase(),
                text: waveStatus
            };
        });

        const {t} = this.props;

        return (
            <Container className="InvoicesPage">
                <Header as='h1'>{t('Invoices')}</Header>
                <Container className="InvoicesPage_filters">
                    <Dropdown
                        placeholder={t('All customers')}
                        selection
                        search
                        clearable
                        options={customerOptions}
                        name="customerId"
                        onChange={this.handleFilterChange.bind(this)}
                    />
                    <Dropdown
                        placeholder={t('All statuses')}
                        selection
                        clearable
                        options={invoiceStatusOptions}
                        name="status"
                        onChange={this.handleFilterChange.bind(this)}
                    />
                    <Input
                        type="date"
                        placeholder='From'
                        name="invoiceDateStart"
                        onChange={this.handleFilterChange.bind(this)}
                    />
                    <Input
                        type="date"
                        placeholder='To'
                        name="invoiceDateEnd"
                        onChange={this.handleFilterChange.bind(this)}
                    />
                    <Input
                        type="text"
                        placeholder={t('Invoice #')}
                        name="invoiceNumber"
                        onChange={this.handleFilterChange.bind(this)}
                    />
                    <Button 
                        color='green'
                        onClick={e => {
                            e.preventDefault();
                            
                            this.setState({
                                loading: true
                            });
                            this.searchHandler();
                        }}
                    >
                        {t('Search')}
                    </Button>
                </Container>
                <Divider hidden />
                {this.state.error && 
                    <Message
                        negative
                        content={this.state.error}
                    />
                }
                {!this.state.error &&
                    <InvoicesTable
                        loading={this.state.loading}
                        invoices={this.state.invoices}
                        customers={this.state.customers}
                        businessInfo={this.props.businessInfo}
                        deleteInvoice={invoiceId => {
                            this.deleteInvoiceHandler(invoiceId);
                        }}
                        editInvoice={invoicePatchData => {
                            this.editInvoiceHandler(invoicePatchData);
                        }}
                    />
                }
                {this.state.pageInfo && 
                    <Pagination
                        boundaryRange={0}
                        activePage={this.state.pageNum}
                        ellipsisItem={null}
                        firstItem={null}
                        lastItem={null}
                        siblingRange={1}
                        totalPages={this.state.pageInfo.totalPages}
                        onPageChange={this.handlePageChange.bind(this)}
                    />
                }
            </Container>
        );
    }
}

export default componentWrapper(InvoicesPage);