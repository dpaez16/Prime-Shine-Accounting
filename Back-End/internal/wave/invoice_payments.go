package wave

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/pkg/errors"
)

type WavePaymentAccount struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type WaveInvoicePayment struct {
	ID             string             `json:"id"`
	PaymentDate    string             `json:"payment_date"`
	Memo           string             `json:"memo"`
	Amount         float32            `json:"amount"`
	PaymentMethod  string             `json:"payment_method"`
	PaymentAccount WavePaymentAccount `json:"payment_account"`
	ExchangeRate   float32            `json:"exchange_rate"`
}

type queryWaveInvoicePaymentsData struct {
	Payments     []WaveInvoicePayment `json:"payments"`
	ExchangeRate float32              `json:"exchange_rate"`
}

func GetInvoicePayments(identityBusinessID string, internalInvoiceID string) (*[]WaveInvoicePayment, error) {
	params := url.Values{}
	params.Set("embed_accounts", "true")
	params.Set("embed_customer", "true")
	params.Set("embed_discounts", "true")
	params.Set("embed_deposits", "true")
	params.Set("embed_items", "true")
	params.Set("embed_payments", "true")
	params.Set("embed_products", "true")
	params.Set("embed_sales_taxes", "true")
	params.Set("embed_attachments", "true")

	path := fmt.Sprintf("/%v/invoices/%v/?%v", identityBusinessID, internalInvoiceID, params.Encode())

	response, err := createWaveBusinessAPIRequest(http.MethodGet, path, nil)
	if err != nil {
		return nil, errors.Wrap(err, "createWaveBusinessAPIRequest")
	}

	var data queryWaveInvoicePaymentsData
	err = json.Unmarshal([]byte(response), &data)
	if err != nil {
		return nil, errors.Wrap(err, "json deserialization")
	}

	return &data.Payments, nil
}

func CreateInvoicePayment(identityBusinessID string, internalInvoiceID string, invoicePaymentID string, invoicePayment map[string]any) (bool, error) {
	path := fmt.Sprintf("/%v/invoices/%v/payments/%v/", identityBusinessID, internalInvoiceID, invoicePaymentID)

	_, err := createWaveBusinessAPIRequest(http.MethodPost, path, &invoicePayment)
	if err != nil {
		return false, errors.Wrap(err, "createWaveBusinessAPIRequest")
	}

	return true, nil
}

func EditInvoicePayment(identityBusinessID string, internalInvoiceID string, invoicePaymentID string, invoicePayment map[string]any) (bool, error) {
	path := fmt.Sprintf("/%v/invoices/%v/payments/%v/", identityBusinessID, internalInvoiceID, invoicePaymentID)

	_, err := createWaveBusinessAPIRequest(http.MethodPatch, path, &invoicePayment)
	if err != nil {
		return false, errors.Wrap(err, "createWaveBusinessAPIRequest")
	}

	return true, nil
}

func DeleteInvoicePayment(identityBusinessID string, internalInvoiceID string, invoicePaymentID string) (bool, error) {
	path := fmt.Sprintf("/%v/invoices/%v/payments/%v/", identityBusinessID, internalInvoiceID, invoicePaymentID)

	_, err := createWaveBusinessAPIRequest(http.MethodDelete, path, nil)
	if err != nil {
		return false, errors.Wrap(err, "createWaveBusinessAPIRequest")
	}

	return true, nil
}
