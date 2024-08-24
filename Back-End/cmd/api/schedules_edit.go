package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type editScheduleBody struct {
	ScheduleID primitive.ObjectID `json:scheduleID`
	StartDay   primitive.DateTime `json:startDay`
}

// Route for editing a schedule.
func (app *application) editSchedule(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body editScheduleBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	schedule, err := app.dbClient.EditSchedule(body.StartDay, body.ScheduleID)
	if err != nil {
		err = errors.Wrap(err, "EditSchedule")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"schedule": schedule}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
