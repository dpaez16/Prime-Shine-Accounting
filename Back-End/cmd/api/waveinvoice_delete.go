package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type deleteWaveInvoiceBody struct {
	InvoiceID string `json:"invoiceID"`
}

// Route for deleting a Wave invoice.
func (app *application) deleteWaveInvoice(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body deleteWaveInvoiceBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	err = wave.DeleteInvoice(body.InvoiceID)
	if err != nil {
		err = errors.Wrap(err, "DeleteInvoice")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"success": true}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, errors.Wrap(err, "writeJSON"))
	}
}
