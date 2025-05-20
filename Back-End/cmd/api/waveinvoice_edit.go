package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type editWaveInvoiceBody struct {
	InvoicePatchInput map[string]any `json:"invoicePatchInput"`
}

// Route for editing a Wave invoice.
func (app *application) editWaveInvoice(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body editWaveInvoiceBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	err = wave.EditInvoice(body.InvoicePatchInput)
	if err != nil {
		err = errors.Wrap(err, "EditInvoice")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"success": true}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, errors.Wrap(err, "writeJSON"))
	}
}
