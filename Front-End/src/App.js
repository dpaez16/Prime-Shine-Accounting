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
            </ul>
            </div>
        );
    }
};