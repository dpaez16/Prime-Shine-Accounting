import { WaveCustomerID } from '@/types/waveCustomer';
import { WaveInvoicePayment } from '@/types/waveInvoicePayment';

export type WaveInvoiceFilterObj = {
    customerId: WaveCustomerID | null,
    invoiceDateStart: string  | null,
    invoiceDateEnd: string  | null,
    invoiceNumber: string | null,
    page: number,
    pageSize: number,
};

export type WaveInvoiceFilterKey = keyof WaveInvoiceFilterObj;

export default class WaveAPIClient {
    static WAVE_INVOICE_STATUSES = [
        'Draft',
        'Unsent',
        'Sent',
        'Viewed',
        'Partial',
        'Paid',
        'Overpaid',
        'Overdue',
    ];

    static #createFetchRequest(body) {
        return fetch(import.meta.env.VITE_WAVE_ENDPOINT_URL, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_WAVE_TOKEN}`,
            },
        });
    }

    static #createFetchBusinessAPIRequest(
        path: string,
        body: object | null,
        method: 'POST' | 'DELETE' | 'PATCH' | 'GET',
    ) {
        return fetch(import.meta.env.VITE_WAVE_BUSINESS_ENDPOINT_URL + path, {
            method: method,
            body: body ? JSON.stringify(body) : null,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_WAVE_TOKEN}`,
            },
        })
            .then(async (response) => {
                if (!response || (response.status !== 200 && response.status !== 201)) {
                    const responseText = await response.text();
                    throw new Error(responseText);
                }

                return response.json();
            });
    }

    /**
    * Grabs the payments for an invoice.
    *
    * @param identityBusinessID The identity business ID obtained from `fetchIdentityBusinessID`.
    * @param invoiceID The invoice to grab payments for.
    * @returns A promise resolving to a list of the invoice's payments.
    */
    static getInvoicePayments(identityBusinessID: string, invoiceID: string) {
        const params = new URLSearchParams({
           'embed_accounts': 'true',
           'embed_customer': 'true',
           'embed_discounts': 'true',
           'embed_deposits': 'true',
           'embed_items': 'true',
           'embed_payments': 'true',
           'embed_products': 'true',
           'embed_sales_taxes': 'true',
           'embed_attachments': 'true',
        });
        const path = `/${identityBusinessID}/invoices/${invoiceID}/?${params.toString()}`;

        return this.#createFetchBusinessAPIRequest(path, null, 'GET');
    }

    /**
    * Creates a payment for an invoice.
    *
    * @param identityBusinessID The identity business ID obtained from `fetchIdentityBusinessID`.
    * @param invoiceID The invoice to grab payments for.
    * @param paymentInfo The payment metadata.
    * @returns A promise resolving to true if the operation was successful, false otherwise.
    */
    static createInvoicePayment(identityBusinessID: string, invoiceID: string, paymentInfo: WaveInvoicePayment) {
        const path = `/${identityBusinessID}/invoices/${invoiceID}/payments/`;

        return this.#createFetchBusinessAPIRequest(path, paymentInfo, 'POST');
    }

    /**
    * Edits an invoice payment.
    *
    * @param identityBusinessID The identity business ID obtained from `fetchIdentityBusinessID`.
    * @param invoiceID The invoice to grab payments for.
    * @param paymentInfo The payment metadata.
    * @returns A promise resolving to true if the operation was successful, false otherwise.
    */
    static editInvoicePayment(identityBusinessID: string, invoiceID: string, paymentInfo: WaveInvoicePayment) {
        const path = `/${identityBusinessID}/invoices/${invoiceID}/payments/`;

        return this.#createFetchBusinessAPIRequest(path, paymentInfo, 'PATCH');
    }

    /**
    * Deletes an invoice payment.
    *
    * @param identityBusinessID
    * @param invoiceID
    * @param paymentID
    * @returns
    */
    static deleteInvoicePayment(identityBusinessID: string, invoiceID: string, paymentID: string) {
        const path = `/${identityBusinessID}/invoices/${invoiceID}/${paymentID}/`;

        return this.#createFetchBusinessAPIRequest(path, null, 'DELETE');
    }

    /**
    * Creates a Wave Invoice.
    * @param {Object} invoiceCreateInput - The invoice's metadata. Must follow the InvoiceCreateInput structure: https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference#invoicecreateinput
    * @return {Promise<Object>} The promise with success returning the newly created invoice, otherwise an error for rejection.
    */
    static createInvoice(invoiceCreateInput) {
        const requestBody = {
            query: `
                    mutation($input: InvoiceCreateInput!) {
                        invoiceCreate(input: $input) {
                            didSucceed
                            inputErrors {
                                code
                                message
                                path
                            }
                            invoice {
                                id
                                createdAt
                                modifiedAt
                                pdfUrl
                                viewUrl
                                status
                                invoiceNumber
                                invoiceDate
                                customer {
                                    id
                                    name
                                }
                                amountDue {
                                    value
                                }
                                amountPaid {
                                    value
                                }
                                total {
                                    value
                                }
                                memo
                                items {
                                    product {
                                        id
                                        name
                                    }
                                    description
                                    total {
                                        value
                                    }
                                }
                            }
                        }
                    }
                    `,
            variables: {
                input: invoiceCreateInput,
            },
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
            .then(async (response) => {
                if (!response || (response.status !== 200 && response.status !== 201)) {
                    const responseText = await response.text();
                    throw new Error(`Could not create invoice: ${responseText}`);
                }

                return response.json();
            })
            .then((json) => {
                if (json.errors !== undefined) {
                    throw new Error(
                        `Could not create invoice: ${JSON.stringify(json.errors)}`,
                    );
                }

                const { inputErrors, invoice } = json.data.invoiceCreate;
                if (inputErrors !== null) {
                    throw new Error(
                        `Could not create invoice due to input errors: ${inputErrors}`,
                    );
                }

                return invoice;
            })
            .catch((err) => {
                throw err;
            });
    }

    /**
    * Edits a Wave Invoice.
    * @param {Object} invoicePatchInput - The invoice's metadata. Must follow the InvoicePatchInput structure: https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference#invoicepatchinput
    * @return {Promise<Object>} The promise with success returning the edited invoice, otherwise an error for rejection.
    */
    static editInvoice(invoicePatchInput) {
        const requestBody = {
            query: `
                    mutation($input: InvoicePatchInput!) {
                        invoicePatch(input: $input) {
                            didSucceed
                            inputErrors {
                                code
                                message
                                path
                            }
                            invoice {
                                id
                                createdAt
                                modifiedAt
                                pdfUrl
                                viewUrl
                                status
                                invoiceNumber
                                invoiceDate
                                customer {
                                    id
                                    name
                                }
                                amountDue {
                                    value
                                }
                                amountPaid {
                                    value
                                }
                                total {
                                    value
                                }
                                memo
                                items {
                                    product {
                                        id
                                        name
                                    }
                                    description
                                    total {
                                        value
                                    }
                                }
                            }
                        }
                    }
                    `,
            variables: {
                input: invoicePatchInput,
            },
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
            .then(async (response) => {
                if (!response || (response.status !== 200 && response.status !== 201)) {
                    const responseText = await response.text();
                    throw new Error(`Could not edit invoice: ${responseText}`);
                }

                return response.json();
            })
            .then((json) => {
                if (json.errors !== undefined) {
                    throw new Error(
                        `Could not edit invoice: ${JSON.stringify(json.errors)}`,
                    );
                }

                const { inputErrors, invoice } = json.data.invoicePatch;
                if (inputErrors !== null) {
                    throw new Error(
                        `Could not edit invoice due to input errors: ${inputErrors}`,
                    );
                }

                return invoice;
            })
            .catch((err) => {
                throw err;
            });
    }

    /**
    * Deletes a Wave Invoice.
    * @param {string} invoiceId - The invoice's unique ID.
    * @return {Promise<boolean>} The promise with success returning a boolean flag indiciating whether the delete was successful, otherwise an error for rejection.
    */
    static deleteInvoice(invoiceId: string) {
        const requestBody = {
            query: `
                    mutation($input: InvoiceDeleteInput!) {
                        invoiceDelete(input: $input) {
                            didSucceed
                            inputErrors {
                                code
                                message
                                path
                            }
                        }
                    }
                    `,
            variables: {
                input: {
                    invoiceId: invoiceId,
                },
            },
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
            .then(async (response) => {
                if (!response || (response.status !== 200 && response.status !== 201)) {
                    const responseText = await response.text();
                    throw new Error(`Could not delete invoice: ${responseText}`);
                }

                return response.json();
            })
            .then((json) => {
                if (json.errors !== undefined) {
                    throw new Error(
                        `Could not delete invoice: ${JSON.stringify(json.errors)}`,
                    );
                }

                const { didSucceed, inputErrors } = json.data.invoiceDelete;
                if (inputErrors !== null) {
                    throw new Error(
                        `Could not delete invoice due to input errors: ${inputErrors}`,
                    );
                }

                return didSucceed;
            })
            .catch((err) => {
                throw err;
            });
    }
}
