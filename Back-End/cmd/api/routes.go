package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (app *application) routes() http.Handler {
	router := httprouter.New()

	router.GET("/api/ping", app.pingCheckHandler)

	// route for login session verification
	router.POST("/api/handshake", app.authenticate(app.handshakeHandler))

	// user routes
	router.POST("/api/login", app.loginUser)
	router.POST("/api/register", app.createUser)
	router.POST("/api/users/edit", app.authenticate(app.editUser))
	router.POST("/api/users/delete", app.authenticate(app.deleteUser))

	// scheduled customer routes
	router.POST("/api/scheduledCustomer/query", app.authenticate(app.queryScheduledCustomers))
	router.POST("/api/scheduledCustomer/create", app.authenticate(app.createScheduledCustomer))
	router.POST("/api/scheduledCustomer/edit", app.authenticate(app.editScheduledCustomer))
	router.POST("/api/scheduledCustomer/delete", app.authenticate(app.deleteScheduledCustomer))

	// schedule day routes
	router.POST("/api/scheduleDay/query", app.authenticate(app.queryScheduleDays))
	router.POST("/api/scheduleDay/create", app.authenticate(app.createScheduleDay))
	router.POST("/api/scheduleDay/delete", app.authenticate(app.deleteScheduleDay))

	// schedule routes
	router.POST("/api/schedule/query", app.authenticate(app.querySchedules))
	router.POST("/api/schedule/create", app.authenticate(app.createSchedule))
	router.POST("/api/schedule/edit", app.authenticate(app.editSchedule))
	router.POST("/api/schedule/delete", app.authenticate(app.deleteSchedule))

	// TODO: add pdf route?
	// https://github.com/go-pdf/fpdf

	return app.recoverPanic(app.enableCORS(router))
}
