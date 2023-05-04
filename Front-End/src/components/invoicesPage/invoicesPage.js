import React, {Component} from 'react';
import {Container, Header, Input, Dropdown, Divider, Pagination, Button} from 'semantic-ui-react';
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
            pageInfo: null
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
            });
        })
        .catch(err => {
            console.log(err);
        });
    }

    componentDidMount() {
        this.fetchAllWaveData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.pageNum !== this.state.pageNum || (!prevState.loading && this.state.loading)) {
            this.fetchAllWaveData();
        }
    }

    handleFilterChange(event, {name, value}) {
        const newFilterParameters = {...this.state.filterParameters, [name]: value};

        this.setState({
            filterParameters: newFilterParameters
        });
    }

    handlePageChange(event, { activePage }) {
        this.setState({
            pageNum: activePage,
            loading: true
        });
    }

    editInvoiceHandler(invoicePatchData) {
        WaveAPIClient.editInvoice(invoicePatchData)
        .then(newInvoice => {
            let newInvoices = [...this.state.invoices];
            const idx = newInvoices.findIndex(invoice => invoice.id === newInvoice.id);
            newInvoices.splice(idx, 1, newInvoice);

            this.setState({
                invoices: newInvoices
            });
        })
        .catch(err => {
            console.log(err);
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
                invoices: newInvoices
            });
        })
        .catch(err => {
            console.log(err);
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
                        defaultValue={this.state.filterParameters.customerId ? this.state.filterParameters.customerId : null}
                        onChange={this.handleFilterChange.bind(this)}
                    />
                    <Dropdown
                        placeholder={t('All statuses')}
                        selection
                        clearable
                        options={invoiceStatusOptions}
                        name="status"
                        defaultValue={this.state.filterParameters.status ? this.state.filterParameters.status : null}
                        onChange={this.handleFilterChange.bind(this)}
                    />
                    <Input
                        type="date"
                        placeholder='From'
                        name="invoiceDateStart"
                        defaultValue={this.state.filterParameters.invoiceDateStart ? this.state.filterParameters.invoiceDateStart : null}
                        onChange={this.handleFilterChange.bind(this)}
                    />
                    <Input
                        type="date"
                        placeholder='To'
                        name="invoiceDateEnd"
                        defaultValue={this.state.filterParameters.invoiceDateEnd ? this.state.filterParameters.invoiceDateEnd : null}
                        onChange={this.handleFilterChange.bind(this)}
                    />
                    <Input
                        type="text"
                        placeholder={t('Invoice #')}
                        id="invoiceNumber"
                        icon={{ 
                            name: 'search', 
                            circular: true, 
                            link: true, 
                            onClick: e => {
                                const invoiceNumber = document.getElementById("invoiceNumber").value;
                                this.handleFilterChange(e, { name: "invoiceNumber", value: invoiceNumber });
                            }
                        }}
                        defaultValue={this.state.filterParameters.invoiceNumber ? this.state.filterParameters.invoiceNumber : null}
                    />
                    <Button 
                        color='green'
                        onClick={e => {
                            e.preventDefault();
                            this.setState({
                                loading: true
                            });
                        }}
                    >
                        {t('Search')}
                    </Button>
                </Container>
                <Divider hidden />
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