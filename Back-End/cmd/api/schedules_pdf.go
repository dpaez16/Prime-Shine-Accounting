package main

import (
	"encoding/json"
	"net/http"

	"codeberg.org/go-pdf/fpdf"
	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type getSchedulePDFBody struct {
	ScheduleID primitive.ObjectID `json:"scheduleID"`
}

// Route for generating a schedule PDF.
func (app *application) getSchedulePDF(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var body getSchedulePDFBody
	err := json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		err = errors.Wrap(err, "json deserialization")
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	// TODO: gather all schedule data

	pdf := fpdf.New("P", "mm", "Letter", "")
	pdf.AddPage()

	// TODO: build out schedule PDF
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Hello, world")

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=\"data.pdf\"")

	err = pdf.Output(w)

	if err != nil {
		err = errors.Wrap(err, "outputting PDF")
		app.errorResponse(w, r, http.StatusInternalServerError, err.Error())
	}
}
