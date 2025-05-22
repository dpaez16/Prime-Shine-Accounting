package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type deleteWaveCustomerBody struct {
	CustomerID string `json:"customerID"`
}

// Route for deleting a Wave customer.
func (app *application) deleteWaveCustomer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body deleteWaveCustomerBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	err = wave.DeleteCustomer(body.CustomerID)
	if err != nil {
		err = errors.Wrap(err, "DeleteCustomer")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"success": true}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, errors.Wrap(err, "writeJSON"))
	}
}
