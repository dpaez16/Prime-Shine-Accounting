package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type createWaveCustomerBody struct {
	CustomerCreateInput map[string]any `json:"customerCreateInput"`
}

// Route for creating a Wave customer.
func (app *application) createWaveCustomer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body createWaveCustomerBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	err = wave.CreateCustomer(body.CustomerCreateInput)
	if err != nil {
		err = errors.Wrap(err, "CreateCustomer")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"success": true}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, errors.Wrap(err, "writeJSON"))
	}
}
