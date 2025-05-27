import React, { useState, useContext } from 'react';
import DeleteCustomerModal from './deleteCustomerModal/deleteCustomerModal';
import { CreateCustomerFormParams, CreateCustomerModal } from './createCustomerModal/createCustomerModal';
import { US_COUNTRY_CODE } from '../../utils/consts';
import { LoadingSegment } from '../loadingSegment/loadingSegment';
import { Input, Table, Message } from 'semantic-ui-react';
import useLocalization from '../../hooks/useLocalization';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import { WaveCustomerCreateInput } from '@/types/waveCustomer';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { WaveAPIClient } from '@/api/waveApiClient';
import { useDataFetcher } from '@/hooks/useDataFetcher';

export const CustomersPage: React.FC = () => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;
    const businessInfo = context.businessInfo!;

    const { data, loading, error, refetch } = useDataFetcher({ fetcher: () => WaveAPIClient.fetchAllCustomers(businessInfo.businessId, userInfo.token) });
    const [searchBarValue, setSearchBarValue] = useState('');
    const { t } = useLocalization();
    const navigate = useNavigate();

    const customers = data ?? [];

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

        const customerCreateInput: WaveCustomerCreateInput = {
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

        return WaveAPIClient.createCustomer(customerCreateInput, userInfo.token);
    };

    const deleteCustomerHandler = (customerId: string) => {
        return WaveAPIClient.deleteCustomer(customerId, userInfo.token);
    };

    if (loading) {
        return <LoadingSegment />;
    }

    const searchBarRegex = new RegExp(searchBarValue.toLowerCase());
    const filteredCustomers = customers.filter((customer) =>
        searchBarRegex.test(customer.name.toLowerCase()),
    );

    return (
        <div className='flex flex-col mx-auto w-1/2'>
            <h1>{t('Customers')}:</h1>
            {error && <Message negative content={error.message} />}
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
                            .then(() => {
                                setSearchBarValue('');
                                refetch();
                            })
                            .catch((err) => alert('Failed to create customer: ' + err.message)); // TODO: use translation hook
                    }}
                />
            </div>
            <Table celled>
                <Table.Body>
                {filteredCustomers.map((customer) => {
                    const customerID = customer.id;

                    return (
                        <Table.Row key={uuidV4()}>
                            <Table.Cell className='flex flex-row justify-between items-center'>
                                <a onClick={(e) => {
                                    e.preventDefault();
                                    const params = new URLSearchParams({
                                        'customerID': customerID,
                                    });

                                    navigate(`/customer?${params.toString()}`);
                                }}>
                                    {customer.name}
                                </a>
                                <DeleteCustomerModal
                                    customer={customer}
                                    onSubmit={() => {
                                        deleteCustomerHandler(customerID)
                                            .then(() => {
                                                setSearchBarValue('');
                                                refetch();
                                            })
                                            .catch((err) => alert('Failed to delete customer: ' + err.message)); // TODO: use translation hook
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
};