package main

import (
	"encoding/json"
	"net/http"

	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type editUserBody struct {
	ID       primitive.ObjectID `json:userID`
	Name     string             `json:name`
	Email    string             `json:email`
	Password string             `json:password`
}

// Route for editing a user.
func (app *application) editUser(w http.ResponseWriter, r *http.Request) {
	var body editUserBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	user, err := app.dbClient.EditUser(body.ID, body.Email, body.Name, body.Password)
	if err != nil {
		err = errors.Wrap(err, "EditUser")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"user": user}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, errors.Wrap(err, "writeJSON"))
	}
}
