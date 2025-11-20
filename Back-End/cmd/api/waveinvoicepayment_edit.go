package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type editWaveInvoicePaymentBody struct {
	IdentityBusinessID   string         `json:"identityBusinessID"`
	InternalInvoiceID    string         `json:"internalInvoiceID"`
	InvoicePaymentID     string         `json:"invoicePaymentID"`
	InvoicePaymentData   map[string]any `json:"invoicePaymentData"`
}

// Route for editing a Wave invoice payment.
func (app *application) editWaveInvoicePayment(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body editWaveInvoicePaymentBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	_, err = wave.EditInvoicePayment(
		body.IdentityBusinessID,
		body.InternalInvoiceID,
		body.InvoicePaymentID,
		body.InvoicePaymentData,
	)

	if err != nil {
		err = errors.Wrap(err, "EditInvoicePayment")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"success": true}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, errors.Wrap(err, "writeJSON"))
	}
}
