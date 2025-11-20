package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type deleteWaveInvoicePaymentBody struct {
	IdentityBusinessID   string         `json:"identityBusinessID"`
	InternalInvoiceID    string         `json:"internalInvoiceID"`
	InvoicePaymentID     string         `json:"invoicePaymentID"`
}

// Route for deleting a Wave invoice payment.
func (app *application) deleteWaveInvoicePayment(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body deleteWaveInvoicePaymentBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	_, err = wave.DeleteInvoicePayment(body.IdentityBusinessID, body.InternalInvoiceID, body.InvoicePaymentID)
	if err != nil {
		err = errors.Wrap(err, "DeleteInvoicePayment")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"success": true}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, errors.Wrap(err, "writeJSON"))
	}
}
