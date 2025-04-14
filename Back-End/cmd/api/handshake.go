package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// Route for verifying the user's login session is valid.
func (app *application) handshakeHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	data := jsondata{"success": true}
	app.writeJSON(w, http.StatusOK, data, nil)
}
