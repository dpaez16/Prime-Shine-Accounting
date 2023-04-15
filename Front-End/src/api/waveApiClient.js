export class WaveAPIClient {
    static #createFetchRequest(body) {
        return fetch(process.env.REACT_APP_WAVE_ENDPOINT_URL, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.REACT_APP_WAVE_TOKEN}`
            }
        });
    }

    /**
     * Fetches all metadata related to the business.
     * @return {Promise<Object>} The promise with success returning the business data, otherwise an error for rejection. 
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
            `
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not fetch business: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors && json.errors.length > 0) {
                throw new Error(`Could not fetch business: ${JSON.stringify(json.errors)}`);
            }

            const businesses = json.data.businesses.edges;
            let business = businesses.filter(edge => edge.node.name === process.env.REACT_APP_WAVE_BUSINESS_NAME);

            if (business.length !== 1) {
                throw new Error(`Could not fetch business: ${process.env.REACT_APP_WAVE_BUSINESS_NAME}`);
            }

            business = business[0].node;
            const businessId = business.id;
            const businessName = business.name;
            
            const products = business.products.edges;
            let product = products.filter(edge => edge.node.name === process.env.REACT_APP_WAVE_CLEANING_PRODUCT_NAME);

            if (product.length !== 1) {
                throw new Error(`Could not fetch cleaning product: ${process.env.REACT_APP_WAVE_CLEANING_PRODUCT_NAME}`);
            }

            product = product[0].node;
            const productId = product.id;
            const productName = product.name;
            
            return {
                businessId: businessId,
                businessName: businessName,
                productId: productId,
                productName: productName
            };
        })
        .catch((err) => {
            throw err;
        });
    }

    /**
     * Creates a Wave Customer.
     * @param {Object} customerCreateInput - The customer's metadata. Must follow the CustomerCreateInput structure: https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference#customercreateinput
     * @return {Promise<Object>} The promise with success returning the newly created customer, otherwise an error for rejection. 
     */
    static createCustomer(customerCreateInput) {
        const requestBody = {
            query: `
            mutation($input: CustomerCreateInput!) {
                customerCreate(input: $input) {
                    didSucceed
                    inputErrors {
                        code
                        message
                        path
                    }
                    customer {
                        id
                        name
                        email
                        mobile
                        phone
                        address {
                            addressLine1
                            addressLine2
                            city
                            province {
                                code
                                name
                            }
                            postalCode
                        }
                    }
                }
            }
            `,
            variables: {
                input: customerCreateInput
            }
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
        .then(async response => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not create customer: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not create customer: ${JSON.stringify(json.errors)}`);
            }

            const { inputErrors, customer } = json.data.customerCreate;
            if (inputErrors !== null) {
                throw new Error(`Could not create customer due to input errors: ${inputErrors}`);
            }

            return customer;
        })
        .catch(err => {
            throw err;
        });
    }

    /**
     * Edits a Wave Customer.
     * @param {Object} customerPatchInput - The customer's metadata. Must follow the CustomerEditInput structure: https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference#customereditinput
     * @return {Promise<Object>} - The promise with success returning the edited customer, otherwise an error for rejection. 
     */
    static editCustomer(customerPatchInput) {
        const requestBody = {
            query: `
            mutation($input: CustomerPatchInput!) {
                customerPatch(input: $input) {
                    didSucceed
                    inputErrors {
                        code
                        message
                        path
                    }
                    customer {
                        id
                        name
                        email
                        mobile
                        phone
                        address {
                            addressLine1
                            addressLine2
                            city
                            province {
                                code
                                name
                            }
                            postalCode
                        }
                    }
                }
            }
            `,
            variables: {
                input: customerPatchInput
            }
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
        .then(async response => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not edit customer: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not edit customer: ${JSON.stringify(json.errors)}`);
            }

            const { inputErrors, customer } = json.data.customerPatch;
            if (inputErrors !== null) {
                throw new Error(`Could not edit customer due to input errors: ${inputErrors}`);
            }

            return customer;
        })
        .catch(err => {
            throw err;
        });
    }

    /**
     * Deletes a Wave Customer.
     * @param {string} customerId - The customer's unique ID.
     * @return {Promise<boolean>} - The promise with success returning a boolean flag indiciating whether the delete was successful, otherwise an error for rejection. 
     */
    static deleteCustomer(customerId) {
        const requestBody = {
            query: `
            mutation($input: CustomerDeleteInput!) {
                customerDelete(input: $input) {
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
                    id: customerId
                }
            }
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
        .then(async response => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not delete customer: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not delete customer: ${JSON.stringify(json.errors)}`);
            }

            const { didSucceed, inputErrors } = json.data.customerDelete;
            if (inputErrors !== null) {
                throw new Error(`Could not delete customer due to input errors: ${inputErrors}`);
            }

            return didSucceed;
        })
        .catch(err => {
            throw err;
        });
    }

    /**
     * Fetches customers from the business.
     * @param {string} businessId - The business's unique ID.
     * @param {number} [pageNum] - The page number to grab customers from.
     * @param {number} [pageSize] - The number of customers to grab from pageNum.
     * @return {Promise<Array<Object>>} - The promise with success returning the requested customers, otherwise an error for rejection. 
     */
    static fetchCustomers(businessId, pageNum=1, pageSize=1000) {
        const requestBody = {
            query: `
            {
                business(id: "${businessId}") {
                    customers(page: ${pageNum}, pageSize: ${pageSize}, sort: [NAME_ASC]) {
                        edges {
                            node {
                                id
                                name
                                email
                                mobile
                                phone
                                address {
                                    addressLine1
                                    addressLine2
                                    city
                                    province {
                                        code
                                        name
                                    }
                                    postalCode
                                }
                            }
                        }
                    }
                }
            }
            `
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not fetch customers: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            // TODO: process raw customers into better format
            return json.data.business.customers.edges.map(rawCustomer => rawCustomer.node);
        })
        .catch((err) => {
            throw err;
        });
    }

    /**
     * Fetches invoices from the business.
     * @param {string} businessId - The business's unique ID.
     * @param {string} customerId - The customer's unique ID.
     * @param {number} [pageNum] - The page number to grab invoices from.
     * @param {number} [pageSize] - The number of invoices to grab from pageNum.
     * @return {Promise<Array<Object>>} - The promise with success returning the requested invoices, otherwise an error for rejection. 
     */
    static fetchInvoices(businessId, customerId, pageNum=1, pageSize=1000) {
        const requestBody = {
            query: `
            {
                business(id: "${businessId}") {
                    invoices(page: ${pageNum}, pageSize: ${pageSize}, customerId: "${customerId}") {
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
            `
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not fetch customers: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            // TODO: process raw invoices into better format
            return {
                pageInfo: json.data.business.invoices.pageInfo,
                invoices: json.data.business.invoices.edges.map(rawInvoice => rawInvoice.node)
            };
        })
        .catch((err) => {
            throw err;
        });
    }

    /**
     * Creates a Wave Invoice.
     * @param {Object} invoiceCreateInput - The invoice's metadata. Must follow the InvoiceCreateInput structure: https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference#invoicecreateinput
     * @return {Promise<Object>} - The promise with success returning the newly created invoice, otherwise an error for rejection. 
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
                input: invoiceCreateInput
            }
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
        .then(async response => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not create invoice: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not create invoice: ${JSON.stringify(json.errors)}`);
            }

            const { inputErrors, invoice } = json.data.invoiceCreate;
            if (inputErrors !== null) {
                throw new Error(`Could not create invoice due to input errors: ${inputErrors}`);
            }

            return invoice;
        })
        .catch(err => {
            throw err;
        });
    }

    /**
     * Edits a Wave Invoice.
     * @param {Object} invoicePatchInput - The invoice's metadata. Must follow the InvoicePatchInput structure: https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference#invoicepatchinput
     * @return {Promise<Object>} - The promise with success returning the edited invoice, otherwise an error for rejection. 
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
                input: invoicePatchInput
            }
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
        .then(async response => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not edit invoice: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not edit invoice: ${JSON.stringify(json.errors)}`);
            }

            const { inputErrors, invoice } = json.data.invoicePatch;
            if (inputErrors !== null) {
                throw new Error(`Could not edit invoice due to input errors: ${inputErrors}`);
            }

            return invoice;
        })
        .catch(err => {
            throw err;
        });
    }

    /**
     * Deletes a Wave Invoice.
     * @param {string} invoiceId - The invoice's unique ID.
     * @return {Promise<boolean>} - The promise with success returning a boolean flag indiciating whether the delete was successful, otherwise an error for rejection. 
     */
    static deleteInvoice(invoiceId) {
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
                    invoiceId: invoiceId
                }
            }
        };

        return WaveAPIClient.#createFetchRequest(requestBody)
        .then(async response => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not delete invoice: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not delete invoice: ${JSON.stringify(json.errors)}`);
            }

            const { didSucceed, inputErrors } = json.data.invoiceDelete;
            if (inputErrors !== null) {
                throw new Error(`Could not delete invoice due to input errors: ${inputErrors}`);
            }

            return didSucceed;
        })
        .catch(err => {
            throw err;
        });
    }
};