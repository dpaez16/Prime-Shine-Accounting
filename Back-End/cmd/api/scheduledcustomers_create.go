package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type createScheduledCustomerBody struct {
	CustomerID       string             `json:customerID`
	ServiceStartTime primitive.DateTime `json:serviceStartTime`
	ServiceEndTime   primitive.DateTime `json:serviceEndTime`
	ScheduleDayID    primitive.ObjectID `json:scheduleDayID`
}

// Route for creating a scheduled customer.
func (app *application) createScheduledCustomer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body createScheduledCustomerBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	scheduledCustomer, err := app.dbClient.CreateScheduledCustomer(body.CustomerID, body.ServiceStartTime, body.ServiceEndTime, body.ScheduleDayID)
	if err != nil {
		err = errors.Wrap(err, "CreateScheduledCustomer")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"scheduledCustomer": scheduledCustomer}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
