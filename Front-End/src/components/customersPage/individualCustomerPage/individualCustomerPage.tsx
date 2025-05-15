import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Message } from 'semantic-ui-react';
import EditCustomerModal from './editCustomerModal/editCustomerModal';
import WaveAPIClient from '../../../api/waveApiClient';
import { US_COUNTRY_CODE } from '../../../utils/consts';
import useLocalization from '../../../hooks/useLocalization';
import { WaveCustomer, WaveCustomerAddress } from '@/types/waveCustomer';
import { CreateCustomerFormParams } from '../createCustomerModal/createCustomerModal';

export default function IndividualCustomerPage() {
    const [error, setError] = useState(null);
    const { t } = useLocalization();
    const location = useLocation();
    const navigate = useNavigate();

    const customer: WaveCustomer = location.state.customer;

    const constructNameElement = (name: string | null) => {
        if (!name) {
            return null;
        }

        return (
            <div>
                <h3>{t('Name')}:</h3>
                <p>{name}</p>
            </div>
        );
    };

    const constructPhoneElement = (phone: string | null) => {
        if (!phone) {
            return null;
        }

        return (
            <div>
                <h3>{t('Phone Number')}:</h3>
                <p>{phone}</p>
            </div>
        );
    };

    const constructMobileElement = (mobile: string | null) => {
        if (!mobile) {
            return null;
        }

        return (
            <div>
                <h3>{t('Mobile')}:</h3>
                <p>{mobile}</p>
            </div>
        );
    };

    const constructEmailElement = (email: string | null) => {
        if (!email) {
            return null;
        }

        return (
            <div>
                <h3>{t('Email')}:</h3>
                <p>{email}</p>
            </div>
        );
    };

    const constructAddressElement = (address: WaveCustomerAddress | null) => {
        if (!address) {
            return null;
        }

        const {
            addressLine1,
            addressLine2,
            city,
            postalCode,
            province
        } = address;

        if (!province) {
            return null;
        }

        const provinceName = province.name;
        const addressLine3 = `${city} ${provinceName}, ${postalCode}`;

        return (
            <div className='flex flex-col'>
                <h3>{t('Address')}:</h3>
                <div className='flex flex-col gap-1'>
                    <span>{addressLine1}</span>
                    {addressLine2 && <span>{addressLine2}</span>}
                    <span>{addressLine3}</span>
                </div>
            </div>
        );
    };

    const constructCustomerPropElements = (customer: WaveCustomer) => {
        const {
            name,
            phone,
            mobile,
            email,
            address
        } = customer;

        const elements = [
            constructNameElement(name),
            constructPhoneElement(phone),
            constructMobileElement(mobile),
            constructEmailElement(email),
            constructAddressElement(address),
        ];

        return elements.filter((element) => element !== null);
    };

    const editCustomerHandler = (formParams: CreateCustomerFormParams) => {
        const {
            name, phone, mobile, email,
            addressLine1, addressLine2, city, provinceCode, postalCode
        } = formParams;

        const customerId = customer.id;

        const customerPatchInput = {
            id: customerId,
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

        return WaveAPIClient.editCustomer(customerPatchInput) as Promise<WaveCustomer>;
    };

    const customerPropElements = constructCustomerPropElements(customer);

    return (
        <div className='flex flex-col gap-10'>
            <div>
                <h1>{customer.name}</h1>
                {error &&
                    <Message
                        negative
                        content={error}
                    />
                }
                <EditCustomerModal
                    customer={customer}
                    onSubmit={(formParams) => {
                        editCustomerHandler(formParams)
                            .then(newCustomer => {
                                navigate('/viewCustomer', {
                                    replace: true,
                                    state: {
                                        customer: newCustomer
                                    }
                                });
                            })
                            .catch(err => {
                                setError(err.message);
                            });
                    }}
                />
            </div>
            <div className='flex flex-col gap-6'>
                {
                    customerPropElements.map((customerElement, idx) => {
                        return (
                            <React.Fragment key={idx}>
                                {customerElement}
                            </React.Fragment>
                        );
                    })
                }
            </div>
        </div>
    );
};
