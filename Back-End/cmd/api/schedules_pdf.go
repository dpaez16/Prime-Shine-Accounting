package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/vec2"

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

	// Determines layout of boxes
	MARGIN_TOP := float64(15)
	MARGIN_X := float64(10)
	MARGIN_BOTTOM := float64(5)

	// Schedule header
	pdf.SetFont("Arial", "B", 16)

	// This should float a bit above the boxes
	pdf.Text(MARGIN_X, MARGIN_TOP-5, "Week of 08/16/2024 - 08/22/2024") // TODO: use schedule

	drawBoxes(MARGIN_TOP, MARGIN_X, MARGIN_BOTTOM, pdf)

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=\"data.pdf\"")

	err = pdf.Output(w)

	if err != nil {
		err = errors.Wrap(err, "outputting PDF")
		app.errorResponse(w, r, http.StatusInternalServerError, err.Error())
	}
}

func drawBoxes(marginTop, marginX, marginBottom float64, pdf *fpdf.Fpdf) {
	pageWidth, pageHeight, _ := pdf.PageSize(0)

	// Draw boxes
	pdf.SetLineCapStyle("square")
	pdf.SetLineWidth(0.5)

	topLeft := vec2.Vec2{X: marginX, Y: marginTop}
	topRight := vec2.Vec2{X: pageWidth - topLeft.X, Y: topLeft.Y}
	bottomLeft := vec2.Vec2{X: topLeft.X, Y: pageHeight - marginBottom}
	bottomRight := vec2.Vec2{X: topRight.X, Y: bottomLeft.Y}

	boxPoints := []vec2.Vec2{
		topLeft,
		topRight,
		bottomRight,
		bottomLeft,
	}

	for i := range boxPoints {
		j := (i + 1) % len(boxPoints)
		pointA := boxPoints[i]
		pointB := boxPoints[j]

		pdf.Line(pointA.X, pointA.Y, pointB.X, pointB.Y)
	}

	// Vertical middle line
	midA := vec2.Midpoint(topLeft, topRight)
	midB := vec2.Midpoint(bottomLeft, bottomRight)
	pdf.Line(midA.X, midA.Y, midB.X, midB.Y)

	// Primary horizontal lines
	verticalDistance := vec2.Distance(topLeft, bottomLeft)

	pointA := vec2.Vec2{X: topLeft.X, Y: topLeft.Y + (verticalDistance / 3)}
	pointB := vec2.Vec2{X: topRight.X, Y: pointA.Y}
	pdf.Line(pointA.X, pointA.Y, pointB.X, pointB.Y)

	pointA = vec2.Vec2{X: topLeft.X, Y: topLeft.Y + (2 * verticalDistance / 3)}
	pointB = vec2.Vec2{X: topRight.X, Y: pointA.Y}
	pdf.Line(pointA.X, pointA.Y, pointB.X, pointB.Y)

	// Horizontal line in bottom-right box
	topLeft = vec2.Vec2{X: midA.X, Y: pointA.Y}
	bottomLeft = vec2.Vec2{X: topLeft.X, Y: bottomLeft.Y}

	pointA = vec2.Midpoint(topLeft, bottomLeft)
	pointB = vec2.Vec2{X: topRight.X, Y: pointA.Y}

	pdf.Line(pointA.X, pointA.Y, pointB.X, pointB.Y)
}
