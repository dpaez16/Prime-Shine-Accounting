import React, { useContext } from 'react';
import { EditCustomerModal } from './modals/editCustomerModal';
import useLocalization from '@/hooks/useLocalization';
import { WaveCustomer, WaveCustomerAddress } from '@/types/waveCustomer';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { WaveAPIClient } from '@/api/waveApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { LoadingSegment } from '@/components/ui/loading-segment';
import { useBrowserQuery } from '@/hooks/useBrowserQuery';
import { ErrorMessage } from '@/components/ui/error-message';
import { PageTitle } from '@/components/ui/page-title';
import { PageHeader } from '@/components/ui/page-header';
import { DeleteCustomerModal } from './modals/deleteCustomerModal';
import { useNavigate } from 'react-router-dom';

type IndividualCustomerPageQuery = {
    customerID?: string;
};

export const IndividualCustomerPage: React.FC = () => {
    const loginSession = useContext(LoginSessionContext);
    const businessInfo = loginSession.businessInfo!;
    const userInfo = loginSession.userInfo!;

    const { t } = useLocalization();
    const navigate = useNavigate();
    const params = useBrowserQuery<IndividualCustomerPageQuery>();

    const { data: customer, loading, error, refetch } = useDataFetcher({ fetcher: () => WaveAPIClient.fetchCustomer(businessInfo.businessId, params.customerID ?? 'undefined', userInfo.token) });

    const constructNameElement = (name: string | null) => {
        if (!name) {
            return null;
        }

        return (
            <Section>
                <PageHeader>{t('Name')}</PageHeader>
                <p>{name}</p>
            </Section>
        );
    };

    const constructPhoneElement = (phone: string | null) => {
        if (!phone) {
            return null;
        }

        return (
            <Section>
                <PageHeader>{t('Phone Number')}</PageHeader>
                <p>{phone}</p>
            </Section>
        );
    };

    const constructMobileElement = (mobile: string | null) => {
        if (!mobile) {
            return null;
        }

        return (
            <Section>
                <PageHeader>{t('Mobile')}</PageHeader>
                <p>{mobile}</p>
            </Section>
        );
    };

    const constructEmailElement = (email: string | null) => {
        if (!email) {
            return null;
        }

        return (
            <Section>
                <PageHeader>{t('Email')}</PageHeader>
                <p>{email}</p>
            </Section>
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
            <Section>
                <PageHeader>{t('Address')}</PageHeader>
                <Section>
                    <span>{addressLine1}</span>
                    {addressLine2 && <span>{addressLine2}</span>}
                    <span>{addressLine3}</span>
                </Section>
            </Section>
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

    if (loading) {
        return <LoadingSegment />;
    }

    if (!customer || error) {
        return <ErrorMessage message={`Unable to load customer: ${error?.message}`} />;
    }

    const customerPropElements = constructCustomerPropElements(customer);

    return (
        <div className='flex flex-col gap-10'>
            <div>
                <PageTitle>{customer.name}</PageTitle>
                <div className='flex flex-row gap-4 mt-4'>
                    <EditCustomerModal
                        customer={customer}
                        onSuccess={() => refetch()}
                    />
                    <DeleteCustomerModal
                        customer={customer}
                        onSuccess={() => {
                            navigate('/customers', {
                                replace: true,
                            });
                        }}
                    />
                </div>
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

interface SectionProps {
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ children }) => {
    return (
        <div className='flex flex-col gap-2'>
            {children}
        </div>
    );
};