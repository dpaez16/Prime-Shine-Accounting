export type WaveCustomerAddress = {
  addressLine1: string;
  addressLine2: string | null;
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
  email: string | null;
  mobile: string | null;
  phone: string | null;
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
