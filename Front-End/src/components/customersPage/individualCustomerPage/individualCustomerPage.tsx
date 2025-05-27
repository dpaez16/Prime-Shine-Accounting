import React, { useContext } from 'react';
import { Message } from 'semantic-ui-react';
import EditCustomerModal from './editCustomerModal/editCustomerModal';
import { US_COUNTRY_CODE } from '../../../utils/consts';
import useLocalization from '../../../hooks/useLocalization';
import { WaveCustomer, WaveCustomerAddress, WaveCustomerPatchInput } from '@/types/waveCustomer';
import { CreateCustomerFormParams } from '../createCustomerModal/createCustomerModal';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { WaveAPIClient } from '@/api/waveApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { WaveCustomerID } from '../../../types/waveCustomer';
import { LoadingSegment } from '@/components/loadingSegment/loadingSegment';
import { useBrowserQuery } from '@/hooks/useBrowserQuery';

type IndividualCustomerPageQuery = {
    customerID?: string;
};

export const IndividualCustomerPage: React.FC = () => {
    const loginSession = useContext(LoginSessionContext);
    const businessInfo = loginSession.businessInfo!;
    const userInfo = loginSession.userInfo!;

    const { t } = useLocalization();
    const params = useBrowserQuery<IndividualCustomerPageQuery>();

    const { data: customer, loading, error, refetch } = useDataFetcher({ fetcher: () => WaveAPIClient.fetchCustomer(businessInfo.businessId, params.customerID ?? 'undefined', userInfo.token) });

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
        const elements = [
            constructNameElement(customer.name),
            constructPhoneElement(customer.phone),
            constructMobileElement(customer.mobile),
            constructEmailElement(customer.email),
            constructAddressElement(customer.address),
        ];

        return elements.filter((element) => element !== null);
    };

    const editCustomerHandler = (customerID: WaveCustomerID, formParams: CreateCustomerFormParams) => {
        const {
            name, phone, mobile, email,
            addressLine1, addressLine2, city, provinceCode, postalCode
        } = formParams;

        const customerPatchInput: WaveCustomerPatchInput = {
            id: customerID,
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

        return WaveAPIClient.editCustomer(customerPatchInput, userInfo.token);
    };

    if (loading) {
        return (
            <div>
                <LoadingSegment />
            </div>
        );
    }

    if (!customer || error) {
        return (
            <div>
                <Message negative content={`Unable to load customer: ${error?.message}`} />
            </div>
        );
    }

    const customerPropElements = constructCustomerPropElements(customer);

    return (
        <div className='flex flex-col gap-10'>
            <div>
                <h1>{customer.name}</h1>
                <EditCustomerModal
                    customer={customer}
                    onSubmit={(formParams) => {
                        editCustomerHandler(customer.id, formParams)
                            .then(() => refetch())
                            .catch(err => alert('Failed to edit customer: ' + err.message)); // TODO: use translation hook
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
