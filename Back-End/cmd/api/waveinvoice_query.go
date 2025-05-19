package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type queryWaveInvoicesBody struct {
	BusinessID   string                     `json:"businessID"`
	FilterStruct wave.WaveInvoiceFilterData `json:"filterStruct"`
}

// Route for querying Wave invoices.
func (app *application) queryWaveInvoices(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryWaveInvoicesBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	invoices, pageInfo, err := wave.GetInvoices(body.BusinessID, body.FilterStruct)
	if err != nil {
		err = errors.Wrap(err, "GetInvoices")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"invoices": invoices, "pageInfo": pageInfo}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}

type queryWaveInvoiceBody struct {
	BusinessID string `json:"businessID"`
	InvoiceID  string `json:"invoiceID"`
}

// Route for querying a specific Wave invoice.
func (app *application) queryWaveInvoice(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryWaveInvoiceBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	invoice, err := wave.GetInvoice(body.BusinessID, body.InvoiceID)
	if err != nil {
		err = errors.Wrap(err, "GetInvoice")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"invoice": invoice}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
