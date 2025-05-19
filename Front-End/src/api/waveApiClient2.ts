import { BusinessID } from '@/types/businessInfo';
import { WaveCustomerCreateInput, WaveCustomerID, WaveCustomerPatchInput } from '@/types/waveCustomer';
import { WaveInvoiceFilterObj } from './waveApiClient';

export class WaveAPIClient2 {
    static #createFetchRequest(
        path: string,
        body: object,
        jwt: string | null = null,
    ) {
        const url = `${import.meta.env.VITE_SCHEDULE_API_ENDPOINT_URL}/api/wave` + path;
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': jwt ?? '',
            },
        })
            .then(async (response) => {
                if (!response || (response.status !== 200 && response.status !== 201)) {
                    const data = await response.json();
                    throw new Error(data.error);
                }

                return response.json();
            });
    }

    static fetchCustomers(businessID: BusinessID, pageNum: number, pageSize: number, jwt: string | null) {
        const body = {
            businessID,
            pageNum,
            pageSize,
        };

        return this.#createFetchRequest('/customers/query', body, jwt);
    }

    static fetchAllCustomers(businessID: BusinessID, jwt: string | null) {
        const body = {
            businessID,
        };

        return this.#createFetchRequest('/customers/queryAll', body, jwt);
    }

    static fetchCustomer(businessID: BusinessID, customerID: WaveCustomerID, jwt: string | null) {
        const body = {
            businessID,
            customerID,
        };

        return this.#createFetchRequest('/customer/query', body, jwt);
    }

    static editCustomer(customerPatchInput: WaveCustomerPatchInput, jwt: string | null) {
        const body = {
            customerPatchInput,
        };

        return this.#createFetchRequest('/customer/edit', body, jwt);
    }

    static createCustomer(customerCreateInput: WaveCustomerCreateInput, jwt: string | null) {
        const body = {
            customerCreateInput,
        };

        return this.#createFetchRequest('/customer/create', body, jwt);
    }

    static deleteCustomer(customerID: WaveCustomerID, jwt: string | null) {
        const body = {
            customerID,
        };

        return this.#createFetchRequest('/customer/delete', body, jwt);
    }

    static fetchInvoices(businessID: BusinessID, waveFilterObj: WaveInvoiceFilterObj, jwt: string | null) {
        const body = {
            businessID: businessID,
            filterStruct: waveFilterObj,
        };

        return this.#createFetchRequest('/invoices/query', body, jwt);
    }
}
