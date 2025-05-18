import { BusinessInfo, InternalBusinessInfo } from '@/types/businessInfo';
import { WaveInvoice } from '@/types/waveInvoice';
import { WaveInvoicePayment } from '@/types/waveInvoicePayment';
import { WavePageInfo } from '@/types/wavePageInfo';

const WAVE_INVOICE_FILTERS = {
    customerId: {
        type: 'ID',
    },
    status: {
        type: 'InvoiceStatus',
    },
    invoiceDateStart: {
        type: 'Date',
    },
    invoiceDateEnd: {
        type: 'Date',
    },
    invoiceNumber: {
        type: 'String',
    },
    page: {
        type: 'Int',
    },
};

export type WaveInvoiceFilterKey = keyof typeof WAVE_INVOICE_FILTERS;
export type WaveInvoiceFilterObj = Record<WaveInvoiceFilterKey, Date | string | number>;

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
    * Fetches the identity business ID required for API calls to Wave's business API.
    *
    * @returns A promise resolving to the identity business ID.
    */
    static fetchIdentityBusinessID() {
        const params = new URLSearchParams({
           'include_personal': 'false',
        });
        const path = `/?${params.toString()}`;

        return this.#createFetchBusinessAPIRequest(path, null, 'GET')
            .then((businesses: InternalBusinessInfo[]) => {
                const business = businesses.find(b => b.company_name === import.meta.env.VITE_WAVE_BUSINESS_NAME);

                if (!business) {
                    throw new Error('Could not find internal business info');
                }

                return business.id;
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
    * Fetches all metadata related to the business.
    * @return {Promise<BusinessInfo>} The promise with success returning the business data, otherwise an error for rejection.
    */
    static fetchBusinessData() {
        const requestBody = {
            query: `
                    {
                        businesses {
                            edges {
                                node {
                                    id
                                    name
                                    products {
                                        edges {
                                            node {
                                                id
                                                name
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    `,
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
            .then(async (response) => {
                if (!response || (response.status !== 200 && response.status !== 201)) {
                    const responseText = await response.text();
                    throw new Error(`Could not fetch business: ${responseText}`);
                }

                return response.json();
            })
            .then((json) => {
                if (json.errors && json.errors.length > 0) {
                    throw new Error(
                        `Could not fetch business: ${JSON.stringify(json.errors)}`,
                    );
                }

                const businesses = json.data.businesses.edges;
                let business = businesses.filter(
                    (edge) => edge.node.name === import.meta.env.VITE_WAVE_BUSINESS_NAME,
                );

                if (business.length !== 1) {
                    throw new Error(
                        `Could not fetch business: ${import.meta.env.VITE_WAVE_BUSINESS_NAME}`,
                    );
                }

                business = business[0].node;
                const businessId = business.id;
                const businessName = business.name;

                const products = business.products.edges;
                let product = products.filter((edge) =>
                    edge.node.name === import.meta.env.VITE_WAVE_CLEANING_PRODUCT_NAME,
                );

                if (product.length !== 1) {
                    throw new Error(
                        `Could not fetch cleaning product: ${import.meta.env.VITE_WAVE_CLEANING_PRODUCT_NAME}`,
                    );
                }

                product = product[0].node;
                const productId = product.id;
                const productName = product.name;

                return {
                    businessId: businessId,
                    businessName: businessName,
                    productId: productId,
                    productName: productName,
                };
            })
            .then(data => {
                return this.fetchIdentityBusinessID().then(identityBusinessID => {
                    return {
                        ...data,
                        identityBusinessID,
                    } as BusinessInfo;
                });
            })
            .catch((err) => {
                throw err;
            });
    }

    /**
    * Fetches invoices from the business.
    *
    * Client can choose to include filters if they wish via the `filterParameters` argument.
    * The filters should conform to the arguments to the `Business.invoices` field: https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference
    * @param {string} businessId - The business's unique ID.
    * @param {number} [pageNum] - The page number to grab invoices from. Defaults to first page.
    * @param {Object} [filterParameters] - Parameters to filter the invoices by. Defaults to no filters.
    * @return {Promise<Object>} The promise with success returning an object containing the requested invoices and page info, otherwise an error for rejection.
    */
    static fetchInvoices(businessId: string, pageNum: number, filterParameters: WaveInvoiceFilterObj) {
        const filterKeys = Object.keys({
            ...filterParameters,
            page: pageNum,
        });

        const variableDefsStr = filterKeys.map((key) => {
            const waveInvoiceFilterMetadata = WAVE_INVOICE_FILTERS[key as WaveInvoiceFilterKey];
            if (waveInvoiceFilterMetadata) {
                return `$${key}: ${waveInvoiceFilterMetadata.type}`;
            }

            return '';
        })
        .filter((e) => e !== '')
        .join(', ');

        const parametersStr = filterKeys.map((key) => {
            const waveInvoiceFilterMetadata = WAVE_INVOICE_FILTERS[key as WaveInvoiceFilterKey];
            if (waveInvoiceFilterMetadata) {
                return `${key}: $${key}`;
            }

            return '';
        })
        .filter((e) => e !== '')
        .join(', ');

        const requestBody = {
            query: `
                    query($businessId: ID!, ${variableDefsStr}) {
                        business(id: $businessId) {
                            invoices(sort: [INVOICE_DATE_DESC], ${parametersStr}) {
                                pageInfo {
                                    currentPage
                                    totalPages
                                    totalCount
                                }
                                edges {
                                    node {
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
                        }
                    }
                    `,
            variables: {
                ...filterParameters,
                businessId: businessId,
                page: pageNum,
            },
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
            .then(async (response) => {
                if (!response || (response.status !== 200 && response.status !== 201)) {
                    const responseText = await response.text();
                    throw new Error(`Could not fetch invoices: ${responseText}`);
                }

                return response.json();
            })
            .then((json) => {
                if (json.errors !== undefined) {
                    throw new Error(
                        `Could not fetch invoices: ${JSON.stringify(json.errors)}`,
                    );
                }

                // TODO: process raw invoices into better format
                return {
                    pageInfo: json.data.business.invoices.pageInfo as WavePageInfo,
                    invoices: json.data.business.invoices.edges.map(
                        (rawInvoice) => rawInvoice.node,
                    ) as WaveInvoice[],
                };
            })
            .catch((err) => {
                throw err;
            });
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
