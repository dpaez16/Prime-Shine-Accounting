package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/data"
	"prime-shine-api/internal/db"
	"time"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type createScheduleBody struct {
	UserID   int       `json:"userID"`
	StartDay time.Time `json:"startDay"`
}

// Route for creating a schedule.
func (app *application) createSchedule(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body createScheduleBody
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

	startDay := db.GetDateFromTimeStruct(body.StartDay)
	schedule, err := data.CreateSchedule(lazyTx, startDay, body.UserID)
	if err != nil {
		err = errors.Wrap(err, "CreateSchedule")
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
