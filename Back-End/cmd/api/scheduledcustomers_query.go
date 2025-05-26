package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/data"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type queryScheduledCustomersBody struct {
	ScheduleID int `json:"scheduleID"`
}

// Route for querying scheduled customers.
func (app *application) queryScheduledCustomers(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryScheduledCustomersBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	// TODO: grab linked wave customers here also
	scheduledCustomers, err := data.QueryScheduledCustomers(app.db, body.ScheduleID)
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
