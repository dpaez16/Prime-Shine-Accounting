package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (app *application) routes() http.Handler {
	router := httprouter.New()

	router.GET("/api/ping", app.pingCheckHandler)

	// user routes
	router.POST("/api/login", app.loginUser)
	router.POST("/api/register", app.authenticate(app.createUser))
	router.POST("/api/scheduledCustomer/query", app.authenticate(app.queryScheduledCustomers))

	return app.recoverPanic(app.enableCORS(router))
}
