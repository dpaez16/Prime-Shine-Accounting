package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type createWaveInvoicePaymentBody struct {
	IdentityBusinessID string         `json:"identityBusinessID"`
	InternalInvoiceID  string         `json:"internalInvoiceID"`
	InvoicePaymentData map[string]any `json:"invoicePaymentData"`
}

// Route for creating a Wave invoice payment.
func (app *application) createWaveInvoicePayment(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body createWaveInvoicePaymentBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	_, err = wave.CreateInvoicePayment(
		body.IdentityBusinessID,
		body.InternalInvoiceID,
		body.InvoicePaymentData,
	)

	if err != nil {
		err = errors.Wrap(err, "CreateInvoicePayment")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"success": true}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, errors.Wrap(err, "writeJSON"))
	}
}
