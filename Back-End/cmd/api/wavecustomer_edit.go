package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type editWaveCustomerBody struct {
	CustomerPatchInput map[string]any `json:"customerPatchInput"`
}

// Route for editing a Wave customer.
func (app *application) editWaveCustomer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body editWaveCustomerBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	err = wave.EditCustomer(body.CustomerPatchInput)
	if err != nil {
		err = errors.Wrap(err, "EditCustomer")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"success": true}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, errors.Wrap(err, "writeJSON"))
	}
}
