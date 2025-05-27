package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/data"
	"prime-shine-api/internal/db"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type editUserBody struct {
	UserID   int    `json:"userID"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Route for editing a user.
func (app *application) editUser(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body editUserBody
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

	user, err := data.EditUser(lazyTx, body.UserID, body.Email, body.Name, body.Password)
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
