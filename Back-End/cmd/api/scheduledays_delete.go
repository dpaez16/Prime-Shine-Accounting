package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type deleteScheduleDaysBody struct {
	ScheduleID primitive.ObjectID `json:scheduleID`
	DayOffset  int                `json:dayOffset`
}

// Route for deleting schedule days.
func (app *application) deleteScheduleDay(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body deleteScheduleDaysBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	success, err := app.dbClient.DeleteScheduleDay(body.ScheduleID, body.DayOffset)
	if err != nil {
		err = errors.Wrap(err, "DeleteScheduleDay")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"success": success}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
