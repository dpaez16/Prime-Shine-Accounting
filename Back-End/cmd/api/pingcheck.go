package main

import (
	"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// Health-check API handler.
func (app *application) pingCheckHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "pong")
}
