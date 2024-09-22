package main

import (
	"fmt"
	"net/http"
	"prime-shine-api/internal"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

// Captures panic calls and logs them.
func (app *application) recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				w.Header().Set("Connection", "close")
				app.serverErrorResponse(w, r, fmt.Errorf("%s", err))
			}
		}()

		next.ServeHTTP(w, r)
	})
}

// Enables CORS for web requests.
func (app *application) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // TODO: change this to http://front-end.com
		w.Header().Set("Access-Control-Allow-Methods", "POST,GET")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		next.ServeHTTP(w, r)
	})
}

// Ensures that requests have a valid JSON Web Token.
func (app *application) authenticate(next httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		token := r.Header.Get("Authorization")
		if token == "" {
			app.errorResponse(w, r, http.StatusUnauthorized, "Unauthorized.")
			return
		}

		tokenValid, err := internal.VerifyToken(token)
		if err != nil {
			app.serverErrorResponse(w, r, errors.Wrap(err, "VerifyToken"))
			return
		}

		if !tokenValid {
			app.errorResponse(w, r, http.StatusUnauthorized, "Unauthorized.")
			return
		}

		next(w, r, ps)
	}
}
