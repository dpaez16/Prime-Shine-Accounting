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

export type FetchWaveCustomersResponse = {
  pageInfo: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  customers: WaveCustomer[];
}

export type WaveCustomerID = WaveCustomer['id'];

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