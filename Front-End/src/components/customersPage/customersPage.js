import {useState, useEffect} from 'react';
import DeleteCustomerModal from './deleteCustomerModal/deleteCustomerModal';
import CreateCustomerModal from './createCustomerModal/createCustomerModal';
import WaveAPIClient from '../../api/waveApiClient';
import {fetchAllCustomers} from '../../utils/helpers';
import {US_COUNTRY_CODE} from '../../utils/consts';
import LoadingSegment from '../loadingSegment/loadingSegment';
import {Input, Table, Header, Container, Message} from 'semantic-ui-react';
import useLocalization from '../../hooks/useLocalization';
import {useNavigate} from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import './customersPage.css';

export default function CustomersPage(props) {
    const [customers, setCustomers] = useState([]);
    const [searchBarValue, setSearchBarValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [t] = useLocalization();
    const navigate = useNavigate();

    useEffect(() => {
        const businessId = props.businessInfo.businessId;

        fetchAllCustomers(businessId)
        .then((customers) => {
            setCustomers(customers);
            setLoading(false);
            setError(null);
        })
        .catch(err => {
            setError(err.message);
        });
    }, []);

    const handleSearchChange = (customerName) => {
        setSearchBarValue(customerName);
    };

    const createCustomerHandler = (formParams) => {
        const businessId = props.businessInfo.businessId;

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
    };

    const deleteCustomerHandler = (customerId) => {
        return WaveAPIClient.deleteCustomer(customerId);
    };

    if (loading) {
        return (
            <LoadingSegment className='CustomersPage_loading' />
        );
    }

    const searchBarRegex = new RegExp(searchBarValue.toLowerCase());
    const filteredCustomers = customers.filter((customer) => searchBarRegex.test(customer.name.toLowerCase()));

    return (
        <Container fluid className="CustomersPage">
            <Header as='h1'>{t('Customers')}:</Header>
            {error && 
                <Message
                    negative
                    content={error}
                />
            }
            <Container fluid className='CustomersPage_searchArea'>
                <Input
                    icon='search'
                    placeholder=''
                    onChange={(e) => {
                        e.preventDefault();

                        const customerName = e.target.value;
                        handleSearchChange(customerName);
                    }}
                />
                <CreateCustomerModal
                    onSubmit={(formParams) => {
                        createCustomerHandler(formParams)
                        .then(newCustomer => {
                            let newCustomers = [...customers];
                            newCustomers.push(newCustomer);
                            newCustomers.sort((a, b) => a.name < b.name ? -1 : 1);

                            setCustomers(newCustomers);
                            setError(null);
                        })
                        .catch(err => {
                            setError(err.message);
                        });
                    }}
                />
            </Container>
            <Table celled className="CustomersPage_table">
                <Table.Body>
                    {
                        filteredCustomers.map((customer, idx) => {
                            return (
                                <Table.Row key={uuidV4()}>
                                    <Table.Cell className="CustomersPage_table_row_cell">
                                        <a
                                            href="/viewCustomer"
                                            onClick={e => {
                                                e.preventDefault();

                                                navigate('/viewCustomer', {
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
                                                deleteCustomerHandler(customer.id)
                                                .then(didSucceed => {
                                                    console.log(didSucceed);

                                                    let newCustomers = [...customers];
                                                    const idx = newCustomers.findIndex(c => c.id === customer.id);
                                                    newCustomers.splice(1, idx);
                                                    
                                                    setCustomers(newCustomers);
                                                    setError(null);
                                                })
                                                .catch(err => {
                                                    setError(err.message);
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
};