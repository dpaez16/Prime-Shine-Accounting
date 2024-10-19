import { FetchWaveCustomersResponse, WaveCustomer } from '@/types/waveCustomer';
import { WaveInvoice } from '@/types/waveInvoice';
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

export default class WaveAPIClient {
  static WAVE_INVOICE_STATUSES = [
    'Draft',
    'Overdue',
    'Paid',
    'Partial',
    'Saved',
    'Sent',
    'Unpaid',
    'Viewed',
  ];

  static #createFetchRequest(body) {
    return fetch(import.meta.env.VITE_WAVE_ENDPOINT_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_WAVE_TOKEN}`,
      },
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
        let product = products.filter(
          (edge) =>
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
        input: customerCreateInput,
      },
    };

    return WaveAPIClient.#createFetchRequest(requestBody)
      .then(async (response) => {
        if (!response || (response.status !== 200 && response.status !== 201)) {
          const responseText = await response.text();
          throw new Error(`Could not create customer: ${responseText}`);
        }

        return response.json();
      })
      .then((json) => {
        if (json.errors !== undefined) {
          throw new Error(
            `Could not create customer: ${JSON.stringify(json.errors)}`,
          );
        }

        const { inputErrors, customer } = json.data.customerCreate;
        if (inputErrors !== null) {
          throw new Error(
            `Could not create customer due to input errors: ${inputErrors}`,
          );
        }

        return customer;
      })
      .catch((err) => {
        throw err;
      });
  }

  /**
   * Edits a Wave Customer.
   * @param {Object} customerPatchInput - The customer's metadata. Must follow the CustomerPatchInput structure: https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference#customerpatchinput
   * @return {Promise<Object>} The promise with success returning the edited customer, otherwise an error for rejection.
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
        input: customerPatchInput,
      },
    };

    return WaveAPIClient.#createFetchRequest(requestBody)
      .then(async (response) => {
        if (!response || (response.status !== 200 && response.status !== 201)) {
          const responseText = await response.text();
          throw new Error(`Could not edit customer: ${responseText}`);
        }

        return response.json();
      })
      .then((json) => {
        if (json.errors !== undefined) {
          throw new Error(
            `Could not edit customer: ${JSON.stringify(json.errors)}`,
          );
        }

        const { inputErrors, customer } = json.data.customerPatch;
        if (inputErrors !== null) {
          throw new Error(
            `Could not edit customer due to input errors: ${inputErrors}`,
          );
        }

        return customer;
      })
      .catch((err) => {
        throw err;
      });
  }

  /**
   * Deletes a Wave Customer.
   * @param {string} customerId - The customer's unique ID.
   * @return {Promise<boolean>} The promise with success returning a boolean flag indiciating whether the delete was successful, otherwise an error for rejection.
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
          id: customerId,
        },
      },
    };

    return WaveAPIClient.#createFetchRequest(requestBody)
      .then(async (response) => {
        if (!response || (response.status !== 200 && response.status !== 201)) {
          const responseText = await response.text();
          throw new Error(`Could not delete customer: ${responseText}`);
        }

        return response.json();
      })
      .then((json) => {
        if (json.errors !== undefined) {
          throw new Error(
            `Could not delete customer: ${JSON.stringify(json.errors)}`,
          );
        }

        const { didSucceed, inputErrors } = json.data.customerDelete;
        if (inputErrors !== null) {
          throw new Error(
            `Could not delete customer due to input errors: ${inputErrors}`,
          );
        }

        return didSucceed;
      })
      .catch((err) => {
        throw err;
      });
  }

  /**
   * Fetches customers from the business.
   * @param {string} businessId - The business's unique ID.
   * @param {number} [pageNum] - The page number to grab customers from. Defaults to first page.
   * @return {Promise<FetchWaveCustomersResponse>} The promise with success returning an object containing the requested customers and page info, otherwise an error for rejection.
   */
  static fetchCustomers(businessId: string, pageNum: number = 1) {
    const requestBody = {
      query: `
            query($businessId: ID!, $pageNum: Int!) {
                business(id: $businessId) {
                    customers(page: $pageNum, sort: [NAME_ASC]) {
                        pageInfo {
                            currentPage
                            totalPages
                            totalCount
                        }
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
            `,
      variables: {
        businessId: businessId,
        pageNum: pageNum,
      },
    };

    return WaveAPIClient.#createFetchRequest(requestBody)
      .then(async (response) => {
        if (!response || (response.status !== 200 && response.status !== 201)) {
          const responseText = await response.text();
          throw new Error(`Could not fetch customers: ${responseText}`);
        }

        return response.json();
      })
      .then((json) => {
        if (json.errors !== undefined) {
          throw new Error(
            `Could not edit invoice: ${JSON.stringify(json.errors)}`,
          );
        }

        // TODO: process raw customers into better format
        return {
          pageInfo: json.data.business.customers.pageInfo,
          customers: json.data.business.customers.edges.map(
            (rawCustomer) => rawCustomer.node,
          ),
        } as FetchWaveCustomersResponse;
      })
      .catch((err) => {
        throw err;
      });
  }

  /**
   * Fetches a customer from the business.
   * @param {string} businessId - The business's unique ID.
   * @param {string} customerId - The customer's unique ID.
   * @return {Promise<WaveCustomer>} The promise with success returning an object containing the requested customer's info, otherwise an error for rejection.
   */
  static fetchCustomer(businessId: string, customerId: string) {
    const requestBody = {
      query: `
            query($businessId: ID!, $customerId: ID!) {
                business(id: $businessId) {
                    customer(id: $customerId) {
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
        businessId: businessId,
        customerId: customerId,
      },
    };

    return WaveAPIClient.#createFetchRequest(requestBody)
      .then(async (response) => {
        if (!response || (response.status !== 200 && response.status !== 201)) {
          const responseText = await response.text();
          throw new Error(`Could not fetch customer: ${responseText}`);
        }

        return response.json();
      })
      .then((json) => {
        if (json.errors !== undefined) {
          throw new Error(
            `Could not fetch customer: ${JSON.stringify(json.errors)}`,
          );
        }

        return json.data.business.customer as WaveCustomer;
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
  static fetchInvoices(businessId, pageNum = 1, filterParameters = {}) {
    const variableDefsStr = Object.keys({
      ...filterParameters,
      ...{ page: pageNum },
    })
      .map((key) => {
        const waveInvoiceFilterMetadata = WAVE_INVOICE_FILTERS[key];
        if (waveInvoiceFilterMetadata) {
          return `$${key}: ${waveInvoiceFilterMetadata.type}`;
        }

        return '';
      })
      .filter((e) => e !== '')
      .join(', ');

    const parametersStr = Object.keys({
      ...filterParameters,
      ...{ page: pageNum },
    })
      .map((key) => {
        const waveInvoiceFilterMetadata = WAVE_INVOICE_FILTERS[key];
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
