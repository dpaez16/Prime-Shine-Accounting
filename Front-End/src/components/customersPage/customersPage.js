import React, {Component} from 'react';
import {Dimmer, Loader, Segment, Input, Table} from 'semantic-ui-react';
import {fetchAllCustomers} from '../../utils/helpers';
import componentWrapper from '../../utils/componentWrapper';
//import './customersPage.css';

class CustomersPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            customers: [],
            searchBarValue: '',
            loading: true
        }
    }

    componentDidMount() {
        const businessId = this.props.businessInfo.businessId;

        fetchAllCustomers(businessId)
        .then((customers) => {
            this.setState({
                customers: customers,
                loading: false
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }

    handleSearchChange(customerName) {
        this.setState({
            searchBarValue: customerName
        });
    }

    render() {
        if (this.state.loading) {
            return (
                <Segment className='CustomersPage_loading'>
                    <Dimmer active 
                            inverted
                    >
                        <Loader inverted 
                                content='Loading' 
                        />
                    </Dimmer>
                </Segment>
            );
        }

        const searchBarRegex = new RegExp(this.state.searchBarValue.toLowerCase());
        const filteredCustomers = this.state.customers.filter((customer) => searchBarRegex.test(customer.name.toLowerCase()));

        return (
            <div className="CustomersPage">
                <p>Customers:</p>
                <Input
                    icon='search'
                    placeholder=''
                    onChange={(e) => {
                        e.preventDefault();

                        const customerName = e.target.value;
                        this.handleSearchChange(customerName);
                    }}
                />
                <Table celled className="CustomersPage_table">
                    <Table.Body>
                        {
                            filteredCustomers.map((customer, idx) => {
                                return (
                                    <Table.Row key={idx}>
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
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })
                        }
                    </Table.Body>
                </Table>
            </div>
        );
    }
};

export default componentWrapper(CustomersPage);