package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/wave"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type queryWaveBusinessAccountsBody struct {
	IdentityBusinessID string `json:"identityBusinessID"`
}

// Route for querying Wave business accounts.
func (app *application) queryWaveBusinessAccounts(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body queryWaveBusinessAccountsBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	accounts, err := wave.GetBusinessAccounts(body.IdentityBusinessID)
	if err != nil {
		err = errors.Wrap(err, "GetBusinessAccounts")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	data := jsondata{"accounts": accounts}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		err = errors.Wrap(err, "writeJSON")
		app.serverErrorResponse(w, r, err)
	}
}
