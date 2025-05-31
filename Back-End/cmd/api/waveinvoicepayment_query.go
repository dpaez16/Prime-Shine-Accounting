package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type queryWaveInvoicePaymentsBody struct {
	IdentityBusinessID string `json:"identityBusinessID"`
	InternalInvoiceID  string `json:"internalInvoiceID"`
}

// Route for querying Wave invoice payments.
func (app *application) queryWaveInvoicePayments(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryWaveInvoicePaymentsBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	invoicePayments, err := wave.GetInvoicePayments(body.IdentityBusinessID, body.InternalInvoiceID)
	if err != nil {
		err = errors.Wrap(err, "GetInvoicePayments")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"invoicePayments": invoicePayments}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
