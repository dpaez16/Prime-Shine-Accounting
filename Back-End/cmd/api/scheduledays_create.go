package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type createScheduleDayBody struct {
	ScheduleID primitive.ObjectID `json:scheduleID`
	DayOffset  int                `json:dayOffset`
}

// Route for creating schedule days.
func (app *application) createScheduleDay(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body createScheduleDayBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	scheduleDay, err := app.dbClient.CreateScheduleDay(body.ScheduleID, body.DayOffset)
	if err != nil {
		err = errors.Wrap(err, "CreateScheduleDay")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"scheduleDay": scheduleDay}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
