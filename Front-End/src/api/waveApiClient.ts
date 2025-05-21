import { WaveInvoicePayment } from '@/types/waveInvoicePayment';

export default class WaveAPIClient {
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
}
