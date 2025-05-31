import { BusinessInfo } from './businessInfo';
import { Prettify } from './prettify';

export type WaveCustomerAddress = {
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: {
        code: string;
        name: string;
    };
    postalCode: string;
};

export type WaveCustomer = {
    id: string;
    name: string;
    email: string;
    mobile: string;
    phone: string;
    address: WaveCustomerAddress;
};

export type WaveCustomerID = WaveCustomer['id'];
export type WaveProvinceCode = WaveCustomerAddress['province']['code'];

export type WaveCustomerPatchInput = Prettify<
    Omit<WaveCustomer, 'address'> &
    Prettify<{
        address: Prettify<
            Omit<WaveCustomerAddress, 'province'> &
            {
                provinceCode: WaveCustomerAddress['province']['code'];
                countryCode: string;
            }
        >
    }>
>;

export type WaveCustomerCreateInput = Prettify<
    Pick<BusinessInfo, 'businessId'> &
    Omit<WaveCustomerPatchInput, 'id'>
>;