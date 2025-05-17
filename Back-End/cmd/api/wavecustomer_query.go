package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type queryWaveCustomersPaginatedBody struct {
	BusinessID string `json:"businessID"`
	PageNum    int    `json:"pageNum"`
	PageSize   int    `json:"pageSize"`
}

// Route for querying Wave customers (paginated).
func (app *application) queryWaveCustomersPaginated(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryWaveCustomersPaginatedBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	customers, pageInfo, err := wave.GetCustomers(body.BusinessID, body.PageNum, body.PageSize)
	if err != nil {
		err = errors.Wrap(err, "GetCustomers")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"customers": customers, "pageInfo": pageInfo}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}

type queryWaveCustomersBody struct {
	BusinessID string `json:"businessID"`
}

// Route for querying all Wave customers.
func (app *application) queryWaveCustomers(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryWaveCustomersBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	customers, err := wave.GetAllCustomers(body.BusinessID)
	if err != nil {
		err = errors.Wrap(err, "GetCustomers")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"customers": customers}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
