// https://developer.waveapps.com/hc/en-us/sections/360006441372-Examples
// https://developer.waveapps.com/hc/en-us/articles/360018937431-API-Playground
// https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference#mutation

export class WaveAPIClient {
    static createFetchRequest(body) {
        return fetch(process.env.REACT_APP_WAVE_ENDPOINT_URL, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.REACT_APP_WAVE_TOKEN}`
            }
        });
    }

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

        return WaveAPIClient.createFetchRequest(requestBody)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not fetch business: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors && json.errors.length > 0) {
                throw new Error(`Could not fetch business: ${json.errors}`);
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

    // TODO: createCustomer

    // TODO: editCustomer

    // TODO: deleteCustomer

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

        return WaveAPIClient.createFetchRequest(requestBody)
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

    static fetchInvoices(businessId, pageNum, pageSize, customerId) {
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

        return WaveAPIClient.createFetchRequest(requestBody)
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

    // TODO: createInvoice

    // TODO: editInvoice

    // TODO: deleteInvoice
};