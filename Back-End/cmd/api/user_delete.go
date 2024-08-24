package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type deleteUserBody struct {
	UserID primitive.ObjectID `json:userID`
}

// Route for deleting a user.
func (app *application) deleteUser(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body deleteUserBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	success, err := app.dbClient.DeleteUser(body.UserID)
	if err != nil {
		err = errors.Wrap(err, "DeleteUser")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"success": success}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, errors.Wrap(err, "writeJSON"))
	}
}
