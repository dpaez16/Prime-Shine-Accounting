package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type loginUserBody struct {
	Email    string `json:email`
	Password string `json:password`
}

// Route for user login.
func (app *application) loginUser(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body loginUserBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	user, err := app.dbClient.QueryUserAndPassword(body.Email, body.Password)
	if err != nil {
		err = errors.Wrap(err, "QueryUserAndPassword")
		app.serverErrorResponse(w, r, err)
		return
	}

	if user == nil {
		app.errorResponse(w, r, http.StatusBadRequest, "Email or password is invalid.")
		return
	}

	token, err := internal.CreateToken(user.ID.String())
	if err != nil {
		err = errors.Wrap(err, "CreateToken")
		app.serverErrorResponse(w, r, err)
		return
	}

	data := jsondata{"user": user, "jwt": token}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
