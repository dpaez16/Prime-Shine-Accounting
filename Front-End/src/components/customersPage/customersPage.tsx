import React, { useState, useEffect, useContext } from 'react';
import DeleteCustomerModal from './deleteCustomerModal/deleteCustomerModal';
import { CreateCustomerFormParams, CreateCustomerModal } from './createCustomerModal/createCustomerModal';
import WaveAPIClient from '../../api/waveApiClient';
import { fetchAllCustomers } from '../../utils/helpers';
import { US_COUNTRY_CODE } from '../../utils/consts';
import LoadingSegment from '../loadingSegment/loadingSegment';
import { Input, Table, Message } from 'semantic-ui-react';
import useLocalization from '../../hooks/useLocalization';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import { WaveCustomer } from '@/types/waveCustomer';
import { LoginSessionContext } from '@/context/LoginSessionContext';

export default function CustomersPage() {
    const context = useContext(LoginSessionContext);
    const businessInfo = context.businessInfo!;

    const [customers, setCustomers] = useState<WaveCustomer[]>([]);
    const [searchBarValue, setSearchBarValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useLocalization();
    const navigate = useNavigate();

    useEffect(() => {
        const businessId = businessInfo.businessId;

        fetchAllCustomers(businessId)
            .then((customers) => {
                setCustomers(customers);
                setLoading(false);
                setError(null);
            })
            .catch((err) => {
                setError(err.message);
            });
    }, []);

    const createCustomerHandler = (formParams: CreateCustomerFormParams) => {
        const businessId = businessInfo.businessId;

        const {
            name,
            phone,
            mobile,
            email,
            addressLine1,
            addressLine2,
            city,
            provinceCode,
            postalCode,
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
                postalCode: postalCode,
            },
        };

        return WaveAPIClient.createCustomer(customerCreateInput);
    };

    const deleteCustomerHandler = (customerId: string) => {
        return WaveAPIClient.deleteCustomer(customerId);
    };

    if (loading) {
        return <LoadingSegment />;
    }

    const searchBarRegex = new RegExp(searchBarValue.toLowerCase());
    const filteredCustomers = customers.filter((customer) =>
        searchBarRegex.test(customer.name.toLowerCase()),
    );

    return (
        <div className='flex flex-col'>
            <h1>{t('Customers')}:</h1>
            {error && <Message negative content={error} />}
            <div className='flex flex-row gap-4'>
                <Input
                    icon='search'
                    placeholder=''
                    onChange={(e) => {
                        e.preventDefault();
                        const customerName = e.target.value;
                        setSearchBarValue(customerName);
                    }}
                />
                <CreateCustomerModal
                    onSubmit={(formParams) => {
                        createCustomerHandler(formParams)
                            .then((newCustomer) => {
                                const newCustomers = [...customers];
                                newCustomers.push(newCustomer);
                                newCustomers.sort((a, b) => a.name.localeCompare(b.name));

                                setCustomers(newCustomers);
                                setError(null);
                            })
                            .catch((err) => {
                                setError(err.message);
                            });
                    }}
                />
            </div>
            <Table celled>
                <Table.Body>
                {filteredCustomers.map((customer) => {
                    return (
                        <Table.Row key={uuidV4()}>
                            <Table.Cell className='flex flex-row justify-between items-center'>
                                <a
                                    href='/viewCustomer'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/viewCustomer', {
                                            state: {
                                                customer: customer,
                                            },
                                        });
                                    }}
                                >
                                    {customer.name}
                                </a>
                                <DeleteCustomerModal
                                    onSubmit={() => {
                                        deleteCustomerHandler(customer.id)
                                            .then((didSucceed) => {
                                                if (!didSucceed) {
                                                    throw new Error('Could not delete customer.');
                                                }

                                                const newCustomers = [...customers];
                                                const idx = newCustomers.findIndex(
                                                    (c) => c.id === customer.id,
                                                );
                                                newCustomers.splice(1, idx);

                                                setCustomers(newCustomers);
                                                setError(null);
                                            })
                                            .catch((err) => {
                                                setError(err.message);
                                            });
                                    }}
                                />
                            </Table.Cell>
                        </Table.Row>
                    );
                })}
                </Table.Body>
            </Table>
        </div>
    );
}
