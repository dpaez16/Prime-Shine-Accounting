import React, {useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {Container, Header, Divider, Message} from 'semantic-ui-react';
import EditCustomerModal from './editCustomerModal/editCustomerModal';
import WaveAPIClient from '../../../api/waveApiClient';
import {US_COUNTRY_CODE} from '../../../utils/consts';
import useLocalization from '../../../hooks/useLocalization';

import './individualCustomerPage.css';

export default function IndividualCustomerPage() {
    const [error, setError] = useState(null);
    const [t] = useLocalization();
    const location = useLocation();
    const navigate = useNavigate();

    const constructNameElement = (name) => {
        if (name) {
            return (
                <React.Fragment>
                    <Header as='h3'>{t('Name')}:</Header>
                    <p>{name}</p>
                </React.Fragment>
            );
        }

        return null;
    };

    const constructPhoneElement = (phone) => {
        if (phone) {
            return (
                <React.Fragment>
                    <Header as='h3'>{t('Phone Number')}:</Header>
                    <p>{phone}</p>
                </React.Fragment>
            );
        }

        return null;
    };

    const constructMobileElement = (mobile) => {
        if (mobile) {
            return (
                <React.Fragment>
                    <Header as='h3'>{t('Mobile')}:</Header>
                    <p>{mobile}</p>
                </React.Fragment>
            );
        }

        return null;
    };

    const constructEmailElement = (email) => {
        if (email) {
            return (
                <React.Fragment>
                    <Header as='h3'>{t('Email')}:</Header>
                    <p>{email}</p>
                </React.Fragment>
            );
        }

        return null;
    };

    const constructAddressElement = (address) => {
        if (address) {
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
                <React.Fragment>
                    <Header as='h3'>{t('Address')}:</Header>
                    <p>{addressLine1}</p>
                    {addressLine2 && <p>{addressLine2}</p>}
                    <p>{addressLine3}</p>
                </React.Fragment>
            );
        }

        return null;
    };

    const constructCustomerPropElements = (customer) => {
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

    const editCustomerHandler = (formParams) => {
        const {
            name, phone, mobile, email,
            addressLine1, addressLine2, city, provinceCode, postalCode
        } = formParams;

        const customerId = location.state.customer.id;

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

        return WaveAPIClient.editCustomer(customerPatchInput);
    }

    const customer = location.state.customer;
    const customerPropElements = constructCustomerPropElements(customer);

    return (
        <Container fluid className='IndividualCustomerPage'>
            <Container fluid className='IndividualCustomerPage_header'>
                <Header as='h1'>{customer.name}</Header>
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
                            navigate("/viewCustomer", {
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
            </Container>
            <Divider hidden />
            <Container fluid className="InvididualCustomerPage_props">
                {
                    customerPropElements.map((customerElement, idx) => {
                        return (
                            <React.Fragment>
                                <Container fluid>
                                    {customerElement}
                                </Container>
                                <Divider hidden />
                            </React.Fragment>
                        );
                    })
                }
            </Container>
        </Container>
    );
};