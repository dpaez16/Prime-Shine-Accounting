package main

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type deleteScheduledCustomerBody struct {
	ID primitive.ObjectID `json:scheduledCustomerID`
}

// Route for deleting a scheduled customer.
func (app *application) deleteScheduledCustomer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body deleteScheduledCustomerBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	success, err := app.dbClient.DeleteScheduledCustomer(body.ID)
	if err != nil {
		err = errors.Wrap(err, "EditScheduledCustomer")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	if !success {
		app.errorResponse(w, r, http.StatusBadRequest, "Unable to delete scheduled customer.")
	}

	data := jsondata{"success": success}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
