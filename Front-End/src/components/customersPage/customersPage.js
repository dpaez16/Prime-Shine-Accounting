import React, {Component} from 'react';
import {Input, Table, Header, Container, Message} from 'semantic-ui-react';
import DeleteCustomerModal from './deleteCustomerModal/deleteCustomerModal';
import CreateCustomerModal from './createCustomerModal/createCustomerModal';
import WaveAPIClient from '../../api/waveApiClient';
import {fetchAllCustomers} from '../../utils/helpers';
import {US_COUNTRY_CODE} from '../../utils/consts';
import componentWrapper from '../../utils/componentWrapper';
import LoadingSegment from '../../utils/loadingSegment';
import { v4 as uuidV4 } from 'uuid';
//import './customersPage.css';

class CustomersPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            customers: [],
            searchBarValue: '',
            loading: true,
            error: null
        };
    }

    componentDidMount() {
        const businessId = this.props.businessInfo.businessId;

        fetchAllCustomers(businessId)
        .then((customers) => {
            this.setState({
                customers: customers,
                loading: false,
                error: null
            });
        })
        .catch((err) => {
            this.setState({
                error: err.message
            });
        });
    }

    handleSearchChange(customerName) {
        this.setState({
            searchBarValue: customerName
        });
    }

    createCustomerHandler(formParams) {
        const businessId = this.props.businessInfo.businessId;

        const {
            name, phone, mobile, email,
            addressLine1, addressLine2, city, provinceCode, postalCode
        } = formParams;

        const customerCreateInput = {
            businessId: businessId,
            name: name,
            phone: phone,
            mobile: mobile,
            email: email,
            address: {
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                city: city,
                provinceCode: provinceCode,
                countryCode: US_COUNTRY_CODE,
                postalCode: postalCode
            }
        };

        return WaveAPIClient.createCustomer(customerCreateInput);
    }

    deleteCustomerHandler(customerId) {
        return WaveAPIClient.deleteCustomer(customerId);
    }

    render() {
        if (this.state.loading) {
            return (
                <LoadingSegment className='CustomersPage_loading' />
            );
        }

        const {t} = this.props;
        const searchBarRegex = new RegExp(this.state.searchBarValue.toLowerCase());
        const filteredCustomers = this.state.customers.filter((customer) => searchBarRegex.test(customer.name.toLowerCase()));

        return (
            <Container className="CustomersPage">
                <Header as='h1'>{t('Customers')}:</Header>
                {this.state.error && 
                    <Message
                        negative
                        content={this.state.error}
                    />
                }
                <Input
                    icon='search'
                    placeholder=''
                    onChange={(e) => {
                        e.preventDefault();

                        const customerName = e.target.value;
                        this.handleSearchChange(customerName);
                    }}
                />
                <CreateCustomerModal
                    onSubmit={(formParams) => {
                        this.createCustomerHandler(formParams)
                        .then(newCustomer => {
                            let newCustomers = [...this.state.customers];
                            newCustomers.push(newCustomer);
                            newCustomers.sort((a, b) => a.name < b.name ? -1 : 1);

                            this.setState({
                                customers: newCustomers,
                                error: null
                            });
                        })
                        .catch(err => {
                            this.setState({
                                error: err.message
                            });
                        });
                    }}
                />
                <Table celled className="CustomersPage_table">
                    <Table.Body>
                        {
                            filteredCustomers.map((customer, idx) => {
                                return (
                                    <Table.Row key={uuidV4()}>
                                        <Table.Cell>
                                            <a
                                                href="/viewCustomer"
                                                onClick={e => {
                                                    e.preventDefault();

                                                    this.props.navigation('/viewCustomer', {
                                                        state: {
                                                            customer: customer
                                                        }
                                                    });
                                                }}
                                            >
                                                {customer.name}
                                            </a>
                                            <DeleteCustomerModal
                                                onSubmit={() => {
                                                    this.deleteCustomerHandler(customer.id)
                                                    .then(didSucceed => {
                                                        console.log(didSucceed);

                                                        let newCustomers = [...this.state.customers];
                                                        const idx = newCustomers.findIndex(c => c.id === customer.id);
                                                        newCustomers.splice(1, idx);
                                                        
                                                        this.setState({
                                                            customers: newCustomers,
                                                            error: null
                                                        });
                                                    })
                                                    .catch(err => {
                                                        this.setState({
                                                            error: err.message
                                                        });
                                                    });
                                                }}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })
                        }
                    </Table.Body>
                </Table>
            </Container>
        );
    }
};

export default componentWrapper(CustomersPage);