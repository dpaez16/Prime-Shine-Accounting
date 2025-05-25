import { BusinessID } from '@/types/businessInfo';
import { WaveCustomerCreateInput, WaveCustomerID, WaveCustomerPatchInput } from '@/types/waveCustomer';
import { WaveInvoiceCreateInput, WaveInvoiceID, WaveInvoicePatchInput } from '@/types/waveInvoice';
import { WaveInvoiceFilterObj } from '@/components/invoicesPage/invoicesSearchToolbar/useInvoicesSearch';
import { ENDPOINT_URL } from '../utils/consts';

export class WaveAPIClient {
    static #createFetchRequest(
        path: string,
        body: object,
        jwt: string | null = null,
    ) {
        const url = `${ENDPOINT_URL}/api/wave` + path;
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

    static fetchInvoice(businessID: BusinessID, invoiceID: WaveInvoiceID, jwt: string | null) {
        const body = {
            businessID,
            invoiceID,
        };

        return this.#createFetchRequest('/invoice/query', body, jwt);
    }

    static editInvoice(invoicePatchInput: WaveInvoicePatchInput, jwt: string | null) {
        const body = {
            invoicePatchInput,
        };

        return this.#createFetchRequest('/invoice/edit', body, jwt);
    }

    static createInvoice(invoiceCreateInput: WaveInvoiceCreateInput, jwt: string | null) {
        const body = {
            invoiceCreateInput,
        };

        return this.#createFetchRequest('/invoice/create', body, jwt);
    }

    static deleteInvoice(invoiceID: WaveInvoiceID, jwt: string | null) {
        const body = {
            invoiceID,
        };

        return this.#createFetchRequest('/invoice/delete', body, jwt);
    }
}
