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

	// schedule routes
	router.POST("/api/schedules/query", app.authenticate(app.querySchedules))
	router.POST("/api/schedule/query", app.authenticate(app.querySchedule))
	router.POST("/api/schedule/create", app.authenticate(app.createSchedule))
	router.POST("/api/schedule/edit", app.authenticate(app.editSchedule))
	router.POST("/api/schedule/delete", app.authenticate(app.deleteSchedule))

	// wave customer routes
	router.POST("/api/wave/customer/query", app.authenticate(app.queryWaveCustomer))
	router.POST("/api/wave/customer/create", app.authenticate(app.createWaveCustomer))
	router.POST("/api/wave/customer/edit", app.authenticate(app.editWaveCustomer))
	router.POST("/api/wave/customer/delete", app.authenticate(app.deleteWaveCustomer))
	router.POST("/api/wave/customers/query", app.authenticate(app.queryWaveCustomersPaginated))
	router.POST("/api/wave/customers/queryAll", app.authenticate(app.queryWaveCustomers))

	// wave invoice routes
	router.POST("/api/wave/invoices/query", app.authenticate(app.queryWaveInvoices))
	router.POST("/api/wave/invoice/query", app.authenticate(app.queryWaveInvoice))
	router.POST("/api/wave/invoice/create", app.authenticate(app.createWaveInvoice))
	router.POST("/api/wave/invoice/edit", app.authenticate(app.editWaveInvoice))
	router.POST("/api/wave/invoice/delete", app.authenticate(app.deleteWaveInvoice))

	// wave invoice payment routes
	router.POST("/api/wave/invoice/payments/query", app.authenticate(app.queryWaveInvoicePayments))

	router.POST("/api/schedule/pdf", app.authenticate(app.getSchedulePDF))

	return app.recoverPanic(app.enableCORS(router))
}
