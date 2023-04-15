import React, {Component} from 'react';
import { WaveAPIClient } from './api/waveApiClient';
import './App.css';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userInfo: null
        };
    }

    getDemoCustomerInput() {
        return {
            "businessId": this.state.businessId,
            "name": "TEST_CUSTOMER",
            "email": "foo@bar.com",
            "mobile": "773-123-4567",
            "phone": "773-123-4567",
            "address": {
                "addressLine1": "123 Main St.",
                "addressLine2": "Unit 123",
                "city": "Chicago",
                "provinceCode": "US-IL",
                "countryCode": "US",
                "postalCode": "12345"
            }
        };
    }

    getEditCustomerInput() {
        return {
            "id": this.state.demoCustomerId,
            "name": "TEST_CUSTOMER2",
            "email": "bar@foo.com",
            "phone": "773-012-3456",
            "mobile": "773-234-5678",
            "address": {
                "addressLine1": "1234 Main St.",
                "addressLine2": "Unit 1234",
                "city": "Chicago",
                "provinceCode": "US-IL",
                "countryCode": "US",
                "postalCode": "12345"
            }
        };
    }

    render() {
        return (
            <div className="App">
            {
                this.state.businessName && 
                <div>
                    <p>Business ID: {this.state.businessId}</p>
                    <p>Business Name: {this.state.businessName}</p>
                    <p>Product ID: {this.state.productId}</p>
                    <p>Product Name: {this.state.productName}</p>
                </div>
            }
            <p>Wave API:</p>
            <ul>
                <li>
                    <button onClick={e => {
                        e.preventDefault();
                        WaveAPIClient.fetchBusinessData()
                            .then(businessData => {
                                this.setState(businessData);
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    }}>
                        fetchBusiness
                    </button>
                </li>
                <li>
                    <button onClick={e => {
                        e.preventDefault();
                        WaveAPIClient.fetchCustomers(this.state.businessId)
                        .then(customers => {
                            console.log(customers);
                        }).catch(err => {
                            console.log(err);
                        });
                    }}>
                        fetchCustomers
                    </button>
                </li>
                <li>
                <label for="fetchInvoices_customerId">Customer ID:</label>&nbsp;&nbsp;
                    <input type="text" id="fetchInvoices_customerId" />
                    <br />
                    <button onClick={e => {
                        e.preventDefault();

                        const customerId = document.getElementById('fetchInvoices_customerId').value;
                        WaveAPIClient.fetchInvoices(this.state.businessId, 1, 20, customerId)
                        .then(data => {
                            const { pageInfo, invoices } = data;
                            console.log(pageInfo);
                            console.log(invoices);
                        }).catch(err => {
                            console.log(err);
                        });
                    }}>
                        fetchInvoices
                    </button>
                </li>
                <li>
                    <button onClick={e => {
                        e.preventDefault();
                        const customerInput = this.getDemoCustomerInput();
                        WaveAPIClient.createCustomer(customerInput)
                        .then(customer => {
                            console.log(customer);
                            this.setState({ demoCustomerId: customer.id });
                        }).catch(err => {
                            console.log(err);
                        });
                    }}>
                        createCustomer
                    </button>
                </li>
                <li>
                    <button onClick={e => {
                        e.preventDefault();
                        const customerInput = this.getEditCustomerInput();
                        WaveAPIClient.editCustomer(customerInput)
                        .then(customer => {
                            console.log(customer);
                        }).catch(err => {
                            console.log(err);
                        });
                    }}>
                        editCustomer
                    </button>
                </li>
                <li>
                    <button onClick={e => {
                        e.preventDefault();
                        WaveAPIClient.deleteCustomer(this.state.demoCustomerId)
                        .then(didSucceed => {
                            console.log(didSucceed);
                        }).catch(err => {
                            console.log(err);
                        });
                    }}>
                        deleteCustomer
                    </button>
                </li>
            </ul>
            </div>
        );
    }
};