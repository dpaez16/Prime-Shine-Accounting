package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type deleteSchedulesBody struct {
	UserID   primitive.ObjectID `json:userID`
	StartDay primitive.DateTime `json:startDay`
}

// Route for deleting schedules.
func (app *application) deleteSchedule(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body deleteSchedulesBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	success, err := app.dbClient.DeleteSchedule(body.StartDay, body.UserID)
	if err != nil {
		err = errors.Wrap(err, "DeleteSchedule")
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
