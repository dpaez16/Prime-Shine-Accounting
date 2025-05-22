package wave

import (
	"encoding/json"
	"fmt"
	"prime-shine-api/internal/graphql"
	"strings"

	"github.com/pkg/errors"
)

type WaveCost struct {
	Value string `json:"value"`
}

type WaveInvoiceItem struct {
	Description string              `json:"description"`
	Product     WaveBusinessProduct `json:"product"`
	Total       WaveCost            `json:"total"`
}

type WaveInvoice struct {
	ID            string            `json:"id"`
	InvoiceNumber string            `json:"invoiceNumber"`
	Customer      WaveCustomer      `json:"customer"`
	AmountDue     WaveCost          `json:"amountDue"`
	AmountPaid    WaveCost          `json:"amountPaid"`
	Total         WaveCost          `json:"total"`
	CreatedAt     string            `json:"createdAt"`   // Timestamp string
	ModifiedAt    string            `json:"modifiedAt"`  // Timestamp string
	InvoiceDate   string            `json:"invoiceDate"` // Timestamp string
	Items         []WaveInvoiceItem `json:"items"`
	Memo          string            `json:"memo"`
	Status        string            `json:"status"`
	PDFUrl        string            `json:"pdfUrl"`
	ViewUrl       string            `json:"viewUrl"`
}

type WaveInvoiceFilterData struct {
	CustomerID       *string `json:"customerId"`
	Status           *string `json:"status"`
	InvoiceDateStart *string `json:"invoiceDateStart"` // Timestamp string
	InvoiceDateEnd   *string `json:"invoiceDateEnd"`   // Timestamp string
	InvoiceNumber    *string `json:"invoiceNumber"`
	Page             int     `json:"page"`
	PageSize         int     `json:"pageSize"`
}

func constructInvoiceFilterStrings(filterStruct WaveInvoiceFilterData) (string, string) {
	var variables []string
	var parameters []string

	helper := func(key string, dataType string) {
		variables = append(variables, fmt.Sprintf("$%v: %v", key, dataType))
		parameters = append(parameters, fmt.Sprintf("%v: $%v", key, key))
	}

	helper("page", graphql.INT)
	helper("pageSize", graphql.INT)

	if filterStruct.CustomerID != nil {
		helper("customerId", graphql.ID)
	}

	if filterStruct.Status != nil {
		helper("status", graphql.INVOICE_STATUS)
	}

	if filterStruct.InvoiceDateStart != nil {
		helper("invoiceDateStart", graphql.DATE)
	}

	if filterStruct.InvoiceDateEnd != nil {
		helper("invoiceDateEnd", graphql.DATE)
	}

	if filterStruct.InvoiceNumber != nil {
		helper("invoiceNumber", graphql.STRING)
	}

	variablesStr := strings.Join(variables, ", ")
	paramsStr := strings.Join(parameters, ", ")

	return variablesStr, paramsStr
}

func constructInvoiceGraphQLVariablesMap(businessID string, filterStruct WaveInvoiceFilterData) WaveGraphQLVariables {
	variables := WaveGraphQLVariables{
		"businessId": businessID,
		"page":       filterStruct.Page,
		"pageSize":   filterStruct.PageSize,
	}

	if filterStruct.CustomerID != nil {
		variables["customerId"] = *filterStruct.CustomerID
	}

	if filterStruct.Status != nil {
		variables["status"] = *filterStruct.Status
	}

	if filterStruct.InvoiceDateStart != nil {
		variables["invoiceDateStart"] = *filterStruct.InvoiceDateStart
	}

	if filterStruct.InvoiceDateEnd != nil {
		variables["invoiceDateEnd"] = *filterStruct.InvoiceDateEnd
	}

	if filterStruct.InvoiceNumber != nil {
		variables["invoiceNumber"] = *filterStruct.InvoiceNumber
	}

	return variables
}

type waveInvoicesQueryData struct {
	Business struct {
		Invoices struct {
			PageInfo WavePageInfoData `json:"pageInfo"`
			Edges    []struct {
				Node WaveInvoice `json:"node"`
			} `json:"edges"`
		} `json:"invoices"`
	} `json:"business"`
}

func GetInvoices(businessID string, filterStruct WaveInvoiceFilterData) (*[]WaveInvoice, *WavePageInfoData, error) {
	variablesStr, paramsStr := constructInvoiceFilterStrings(filterStruct)
	variables := constructInvoiceGraphQLVariablesMap(businessID, filterStruct)

	// TODO: reduce the amount of data grabbed to match use case
	body := WaveGraphQLBody{
		Query: fmt.Sprintf(`
					query($businessId: ID!, %v) {
						business(id: $businessId) {
							invoices(sort: [INVOICE_DATE_DESC], %v) {
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
		`, variablesStr, paramsStr),
		Variables: variables,
	}

	response, err := createWaveGraphQLRequest(body)
	if err != nil {
		return nil, nil, errors.Wrap(err, "createWaveGraphQLRequest")
	}

	var queryData waveInvoicesQueryData
	err = json.Unmarshal([]byte(response), &queryData)
	if err != nil {
		return nil, nil, errors.Wrap(err, "json deserialization")
	}

	var invoices []WaveInvoice
	for _, edge := range queryData.Business.Invoices.Edges {
		invoices = append(invoices, edge.Node)
	}

	return &invoices, &queryData.Business.Invoices.PageInfo, nil
}

type waveInvoiceQueryData struct {
	Business struct {
		Invoice WaveInvoice `json:"invoice"`
	} `json:"business"`
}

func GetInvoice(businessID string, invoiceID string) (*WaveInvoice, error) {
	body := WaveGraphQLBody{
		Query: `
					query($businessId: ID!, $invoiceId: ID!) {
						business(id: $businessId) {
							invoice(id: $invoiceId) {
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
		Variables: WaveGraphQLVariables{
			"businessId": businessID,
			"invoiceId":  invoiceID,
		},
	}

	response, err := createWaveGraphQLRequest(body)
	if err != nil {
		return nil, errors.Wrap(err, "createWaveGraphQLRequest")
	}

	var queryData waveInvoiceQueryData
	err = json.Unmarshal([]byte(response), &queryData)
	if err != nil {
		return nil, errors.Wrap(err, "json deserialization")
	}

	return &queryData.Business.Invoice, nil
}

type editInvoiceMutationData struct {
	InvoicePatch struct {
		DidSucceed  bool              `json:"didSucceed"`
		InputErrors *[]WaveInputError `json:"inputErrors"`
	} `json:"invoicePatch"`
}

func EditInvoice(invoicePatchInput map[string]any) error {
	body := WaveGraphQLBody{
		Query: `
					mutation($input: InvoicePatchInput!) {
						invoicePatch(input: $input) {
							didSucceed
							inputErrors {
								code
								message
								path
							}
						}
					}
		`,
		Variables: WaveGraphQLVariables{
			"input": invoicePatchInput,
		},
	}

	response, err := createWaveGraphQLRequest(body)
	if err != nil {
		return errors.Wrap(err, "createWaveGraphQLRequest")
	}

	var mutationData editInvoiceMutationData
	err = json.Unmarshal([]byte(response), &mutationData)
	if err != nil {
		return errors.Wrap(err, "json deserialization")
	}

	inputErrors := mutationData.InvoicePatch.InputErrors
	didSucceed := mutationData.InvoicePatch.DidSucceed

	if inputErrors != nil {
		return errors.Errorf("%v", *inputErrors)
	}

	if !didSucceed {
		return errors.New("Failed to edit invoice.")
	}

	return nil
}

type deleteInvoiceMutationData struct {
	InvoiceDelete struct {
		DidSucceed  bool              `json:"didSucceed"`
		InputErrors *[]WaveInputError `json:"inputErrors"`
	} `json:"invoiceDelete"`
}

func DeleteInvoice(invoiceID string) error {
	body := WaveGraphQLBody{
		Query: `
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
		Variables: WaveGraphQLVariables{
			"input": map[string]any{
				"invoiceId": invoiceID,
			},
		},
	}

	response, err := createWaveGraphQLRequest(body)
	if err != nil {
		return errors.Wrap(err, "createWaveGraphQLRequest")
	}

	var mutationData deleteInvoiceMutationData
	err = json.Unmarshal([]byte(response), &mutationData)
	if err != nil {
		return errors.Wrap(err, "json deserialization")
	}

	inputErrors := mutationData.InvoiceDelete.InputErrors
	didSucceed := mutationData.InvoiceDelete.DidSucceed

	if inputErrors != nil {
		return errors.Errorf("%v", *inputErrors)
	}

	if !didSucceed {
		return errors.New("Failed to delete invoice.")
	}

	return nil
}

type createInvoiceMutationData struct {
	InvoiceCreate struct {
		DidSucceed  bool              `json:"didSucceed"`
		InputErrors *[]WaveInputError `json:"inputErrors"`
	} `json:"invoiceCreate"`
}

func CreateInvoice(invoiceCreateInput map[string]any) error {
	body := WaveGraphQLBody{
		Query: `
					mutation($input: InvoiceCreateInput!) {
						invoiceCreate(input: $input) {
							didSucceed
							inputErrors {
								code
								message
								path
							}
						}
					}
		`,
		Variables: WaveGraphQLVariables{
			"input": invoiceCreateInput,
		},
	}

	response, err := createWaveGraphQLRequest(body)
	if err != nil {
		return errors.Wrap(err, "createWaveGraphQLRequest")
	}

	var mutationData createInvoiceMutationData
	err = json.Unmarshal([]byte(response), &mutationData)
	if err != nil {
		return errors.Wrap(err, "json deserialization")
	}

	inputErrors := mutationData.InvoiceCreate.InputErrors
	didSucceed := mutationData.InvoiceCreate.DidSucceed

	if inputErrors != nil {
		return errors.Errorf("%v", *inputErrors)
	}

	if !didSucceed {
		return errors.New("Failed to create invoice.")
	}

	return nil
}
