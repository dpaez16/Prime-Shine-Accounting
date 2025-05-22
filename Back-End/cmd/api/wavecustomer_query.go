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
		err = errors.Wrap(err, "GetAllCustomers")
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

type queryWaveCustomerBody struct {
	BusinessID string `json:"businessID"`
	CustomerID string `json:"customerID"`
}

// Route for querying a specific Wave customer.
func (app *application) queryWaveCustomer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryWaveCustomerBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	customer, err := wave.GetCustomer(body.BusinessID, body.CustomerID)
	if err != nil {
		err = errors.Wrap(err, "GetCustomer")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"customer": customer}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
