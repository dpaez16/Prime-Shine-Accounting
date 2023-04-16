import React, {Component} from 'react';
import { WaveAPIClient } from './api/waveApiClient';
import { PrimeShineAPIClient } from './api/primeShineApiClient';
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

    getCreateInvoiceInput() {
        const date = new Date();

        return {
            businessId: this.state.businessId,
            customerId: this.state.demoCustomerId,
            status: "SAVED",
            currency: "USD",
            invoiceDate: date.toLocaleDateString('en-ca'), // needs to be yyyy-mm-dd format
            memo: "Memo",
            items: [
                {
                    productId: this.state.productId,
                    description: "Regular Cleaning",
                    quantity: 1,
                    unitPrice: 120,
                    taxes: undefined
                },
                {
                    productId: this.state.productId,
                    description: "Move Out Cleaning",
                    quantity: 1,
                    unitPrice: 150,
                    taxes: undefined
                }
            ]
        };
    }

    getEditInvoiceInput() {
        const date = new Date();

        return {
            id: this.state.demoCustomerInvoiceId,
            customerId: this.state.demoCustomerId,
            status: "SAVED",
            currency: "USD",
            invoiceDate: date.toLocaleDateString('en-ca'), // needs to be yyyy-mm-dd format
            memo: "Memo2",
            items: [
                {
                    productId: this.state.productId,
                    description: "Regular Cleaning",
                    quantity: 1,
                    unitPrice: 220,
                    taxes: undefined
                },
                {
                    productId: this.state.productId,
                    description: "Move Out Cleaning",
                    quantity: 1,
                    unitPrice: 250,
                    taxes: undefined
                }
            ]
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
                        .then(data => {
                            const { pageInfo, customers } = data;
                            console.log(pageInfo);
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
                        const filterParameters = {
                            customerId: customerId
                        };
                        WaveAPIClient.fetchInvoices(this.state.businessId, 1, filterParameters)
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

                        // fails if there's invoices associated with customer: https://support.waveapps.com/hc/en-us/articles/360047951392
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
                <li>
                    <button onClick={e => {
                        e.preventDefault();
                        const invoiceInput = this.getCreateInvoiceInput();
                        WaveAPIClient.createInvoice(invoiceInput)
                        .then(invoice => {
                            console.log(invoice);
                            this.setState({ demoCustomerInvoiceId: invoice.id });
                        }).catch(err => {
                            console.log(err);
                        });
                    }}>
                        createInvoice
                    </button>
                </li>
                <li>
                    <button onClick={e => {
                        e.preventDefault();
                        const invoiceInput = this.getEditInvoiceInput();
                        WaveAPIClient.editInvoice(invoiceInput)
                        .then(invoice => {
                            console.log(invoice);
                        }).catch(err => {
                            console.log(err);
                        });
                    }}>
                        editInvoice
                    </button>
                </li>
                <li>
                    <button onClick={e => {
                        e.preventDefault();
                        WaveAPIClient.deleteInvoice(this.state.demoCustomerInvoiceId)
                        .then(didSucceed => {
                            console.log(didSucceed);
                        }).catch(err => {
                            console.log(err);
                        });
                    }}>
                        deleteInvoice
                    </button>
                </li>
            </ul>
            {
                this.state.userInfo && 
                <div>
                    <p>ID: {this.state.userInfo.userId}</p>
                    <p>Name: {this.state.userInfo.name}</p>
                    <p>Email: {this.state.userInfo.email}</p>
                    <p>JWT: {this.state.userInfo.jwtToken}</p>
                </div>
            }
            <p>Prime Shine API:</p>
            <ul>
                <li>
                    <label for="loginUser_email">Email:</label>&nbsp;&nbsp;
                    <input type="text" id="loginUser_email" />
                    <br />
                    <label for="loginUser_password">Password:</label>&nbsp;&nbsp;
                    <input type="password" id="loginUser_password" />
                    <br />
                    <button onClick={e => {
                        e.preventDefault();

                        const email = document.getElementById('loginUser_email').value;
                        const password = document.getElementById('loginUser_password').value;
                        PrimeShineAPIClient.loginUser(email, password)
                        .then((user) => {
                            this.setState({userInfo: {
                                userId: user._id,
                                name: user.name,
                                email: user.email,
                                jwtToken: user.token
                            }});
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                    }}>
                        loginUser
                    </button>
                </li>
            </ul>
            </div>
        );
    }
};