package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal"
	"prime-shine-api/internal/data"
	"prime-shine-api/internal/db"
	"prime-shine-api/internal/wave"
	"strconv"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type createUserBody struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
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

	// TODO: move this to middleware
	lazyTx := db.NewLazyTx(app.db)
	defer func() {
		if rec := recover(); rec != nil {
			_ = lazyTx.Rollback()
			err = errors.Errorf("%v", rec)
			app.serverErrorResponse(w, r, err)
		} else if r.Context().Err() != nil {
			// req is cancelled by client, timeout, or app ctx cancelled.
			_ = lazyTx.Rollback()
		} else {
			if err := lazyTx.Commit(); err != nil {
				err = errors.New("Transaction failed to commit")
				app.serverErrorResponse(w, r, err)
			}
		}
	}()

	user, err := data.CreateUser(lazyTx, body.Name, body.Email, body.Password)
	if err != nil {
		err = errors.Wrap(err, "CreateUser")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	businessInfo, err := wave.GetBusinessInfo()
	if err != nil {
		err = errors.Wrap(err, "GetBusinessInfo")
		app.serverErrorResponse(w, r, err)
		return
	}

	jwt, err := internal.CreateToken(strconv.Itoa(user.ID))
	if err != nil {
		err = errors.Wrap(err, "CreateToken")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"user": user, "businessInfo": businessInfo, "jwt": jwt}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
