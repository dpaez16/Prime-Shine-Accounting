package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type createScheduleBody struct {
	UserID   primitive.ObjectID `json:userID`
	StartDay primitive.DateTime `json:startDay`
}

// Route for creating a schedule.
func (app *application) createSchedule(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body createScheduleBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	schedule, err := app.dbClient.CreateSchedule(body.StartDay, body.UserID)
	if err != nil {
		err = errors.Wrap(err, "CreateSchedule")
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
