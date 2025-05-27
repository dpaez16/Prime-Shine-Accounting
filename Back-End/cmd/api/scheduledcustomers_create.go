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

type createScheduledCustomerBody struct {
	CustomerID string    `json:"waveCustomerID"`
	StartTime  time.Time `json:"startTime"`
	EndTime    time.Time `json:"endTime"`
	DayOffset  int       `json:"dayOffset"`
	ScheduleID int       `json:"scheduleID"`
}

// Route for creating a scheduled customer.
func (app *application) createScheduledCustomer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body createScheduledCustomerBody
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

	scheduledCustomer, err := data.CreateScheduledCustomer(
		lazyTx,
		body.CustomerID,
		db.GetTimestamptzFromTimeStruct(body.StartTime),
		db.GetTimestamptzFromTimeStruct(body.EndTime),
		body.DayOffset,
		body.ScheduleID,
	)

	if err != nil {
		err = errors.Wrap(err, "CreateScheduledCustomer")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"scheduledCustomer": scheduledCustomer}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
