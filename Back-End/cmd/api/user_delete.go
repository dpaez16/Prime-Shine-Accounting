package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/data"
	"prime-shine-api/internal/db"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type deleteUserBody struct {
	UserID int `json:"userID"`
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

	success, err := data.DeleteUser(lazyTx, body.UserID)
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
