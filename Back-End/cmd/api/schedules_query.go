package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type querySchedulesBody struct {
	UserID primitive.ObjectID `json:userID`
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

	schedules, err := app.dbClient.QuerySchedules(body.UserID)
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
