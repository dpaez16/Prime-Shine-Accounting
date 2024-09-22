package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type createUserBody struct {
	Name     string `json:name`
	Email    string `json:email`
	Password string `json:password`
}

// Route for creating a user.
func (app *application) createUser(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body createUserBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	user, err := app.dbClient.CreateUser(body.Name, body.Email, body.Password)
	if err != nil {
		err = errors.Wrap(err, "CreateUser")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	jwt, err := internal.CreateToken(user.ID.String())
	if err != nil {
		err = errors.Wrap(err, "CreateToken")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"user": user, "jwt": jwt}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
