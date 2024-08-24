package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type queryScheduleDaysBody struct {
	ScheduleID primitive.ObjectID `json:scheduleID`
}

// Route for querying schedule days.
func (app *application) queryScheduleDays(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryScheduleDaysBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	scheduleDays, err := app.dbClient.QueryScheduleDays(body.ScheduleID)
	if err != nil {
		err = errors.Wrap(err, "QueryScheduleDays")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"scheduleDays": scheduleDays}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
