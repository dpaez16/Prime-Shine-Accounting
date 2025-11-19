import { BusinessID } from '@/types/businessInfo';
import { WaveCustomer, WaveCustomerCreateInput, WaveCustomerID, WaveCustomerPatchInput } from '@/types/waveCustomer';
import { WaveInternalInvoiceID, WaveInvoice, WaveInvoiceCreateInput, WaveInvoiceID, WaveInvoicePatchInput } from '@/types/waveInvoice';
import { WaveInvoiceFilterObj } from '@/components/invoicesPage/toolbar/useInvoicesSearch';
import { JWT } from '@/types/userInfo';
import { WavePageInfo } from '@/types/wavePageInfo';
import { IdentityBusinessID } from '../types/businessInfo';
import { WaveInvoicePayment } from '@/types/waveInvoicePayment';

export class WaveAPIClient {
    static #createFetchRequest(
        path: string,
        body: object,
        jwt: JWT | null = null,
    ) {
        const url = '/api/wave' + path;
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

    static fetchCustomers(businessID: BusinessID, pageNum: number, pageSize: number, jwt: JWT | null) {
        const body = {
            businessID,
            pageNum,
            pageSize,
        };

        return this.#createFetchRequest('/customers/query', body, jwt)
            .then(data => {
                return {
                    customers: data.customers as WaveCustomer[],
                    pageInfo: data.pageInfo as WavePageInfo,
                };
            });
    }

    static fetchAllCustomers(businessID: BusinessID, jwt: JWT | null) {
        const body = {
            businessID,
        };

        return this.#createFetchRequest('/customers/queryAll', body, jwt)
            .then(json => json.customers as WaveCustomer[]);
    }

    static fetchCustomer(businessID: BusinessID, customerID: WaveCustomerID, jwt: JWT | null) {
        const body = {
            businessID,
            customerID,
        };

        return this.#createFetchRequest('/customer/query', body, jwt)
            .then(data => data.customer as WaveCustomer);
    }

    static editCustomer(customerPatchInput: WaveCustomerPatchInput, jwt: JWT | null) {
        const body = {
            customerPatchInput,
        };

        return this.#createFetchRequest('/customer/edit', body, jwt)
            .then(() => true);
    }

    static createCustomer(customerCreateInput: WaveCustomerCreateInput, jwt: JWT | null) {
        const body = {
            customerCreateInput,
        };

        return this.#createFetchRequest('/customer/create', body, jwt)
            .then(() => true);
    }

    static deleteCustomer(customerID: WaveCustomerID, jwt: JWT | null) {
        const body = {
            customerID,
        };

        return this.#createFetchRequest('/customer/delete', body, jwt)
            .then(() => true);
    }

    static fetchInvoices(businessID: BusinessID, waveFilterObj: WaveInvoiceFilterObj, jwt: JWT | null) {
        const body = {
            businessID: businessID,
            filterStruct: {
              ...waveFilterObj,
              status: waveFilterObj.status ? waveFilterObj.status.toUpperCase() : undefined,
            },
        };

        return this.#createFetchRequest('/invoices/query', body, jwt)
            .then(data => {
                    return {
                        invoices: data.invoices as WaveInvoice[],
                        pageInfo: data.pageInfo as WavePageInfo,
                    };
                });
    }

    static fetchInvoice(businessID: BusinessID, invoiceID: WaveInvoiceID, jwt: JWT | null) {
        const body = {
            businessID,
            invoiceID,
        };

        return this.#createFetchRequest('/invoice/query', body, jwt)
            .then(data => data.invoice as WaveInvoice);
    }

    static editInvoice(invoicePatchInput: WaveInvoicePatchInput, jwt: JWT | null) {
        const body = {
            invoicePatchInput,
        };

        return this.#createFetchRequest('/invoice/edit', body, jwt)
            .then(() => true);
    }

    static createInvoice(invoiceCreateInput: WaveInvoiceCreateInput, jwt: JWT | null) {
        const body = {
            invoiceCreateInput,
        };

        return this.#createFetchRequest('/invoice/create', body, jwt)
            .then(() => true);
    }

    static deleteInvoice(invoiceID: WaveInvoiceID, jwt: JWT | null) {
        const body = {
            invoiceID,
        };

        return this.#createFetchRequest('/invoice/delete', body, jwt)
            .then(() => true);
    }

    static fetchInvoicePayments(identityBusinessID: IdentityBusinessID, internalInvoiceID: WaveInternalInvoiceID, jwt: JWT | null) {
        const body = {
            identityBusinessID,
            internalInvoiceID,
        };

        return this.#createFetchRequest('/invoice/payments/query', body, jwt)
            .then(data => data.invoicePayments as WaveInvoicePayment[]);
    }
}
