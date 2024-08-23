package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type queryScheduledCustomerBody struct {
	ScheduleDayID primitive.ObjectID `json:scheduleDayID`
}

// Route for querying scheduled customers.
func (app *application) queryScheduledCustomers(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryScheduledCustomerBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	scheduledCustomers, err := app.dbClient.QueryScheduledCustomers(body.ScheduleDayID)
	if err != nil {
		err = errors.Wrap(err, "QueryScheduledCustomers")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"scheduledCustomers": scheduledCustomers}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
