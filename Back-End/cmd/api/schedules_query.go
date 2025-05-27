package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/data"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type querySchedulesBody struct {
	UserID int `json:"userID"`
}

// Route for querying schedules.
func (app *application) querySchedules(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body querySchedulesBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	schedules, err := data.QuerySchedules(app.db, body.UserID)
	if err != nil {
		err = errors.Wrap(err, "QuerySchedules")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"schedules": schedules}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}

type queryScheduleBody struct {
	ScheduleID int `json:"scheduleID"`
}

// Route for querying a specific schedule.
func (app *application) querySchedule(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryScheduleBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	filter := map[string]any{"scheduleid": body.ScheduleID}
	schedule, err := data.FindOneSchedule(app.db, filter)
	if err != nil {
		err = errors.Wrap(err, "FindOneSchedule")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	if schedule == nil {
		err = errors.New("could not find schedule")
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
