package main

import (
	"encoding/json"
	"net/http"
	"prime-shine-api/internal/vec2"
	"strings"

	"codeberg.org/go-pdf/fpdf"
	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

type getSchedulePDFBody struct {
	ScheduleID int `json:"scheduleID"`
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
	pdf.SetAutoPageBreak(false, 0)
	pdf.AddPage()

	// Determines layout of boxes
	MARGIN_TOP := float64(15)
	MARGIN_X := float64(10)
	MARGIN_BOTTOM := float64(5)

	// Schedule header
	pdf.SetFont("Arial", "B", 16)
	pdf.Text(MARGIN_X, MARGIN_TOP-5, "Week of 08/16/2024 - 08/22/2024") // TODO: use schedule

	drawBoxes(MARGIN_TOP, MARGIN_X, MARGIN_BOTTOM, pdf)
	fillDayBoxes(MARGIN_TOP, MARGIN_X, MARGIN_BOTTOM, pdf)

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

func fillDayBox(refPoint vec2.Vec2, boxWidth, boxHeight float64, header string, lines []string, pdf *fpdf.Fpdf) {
	HEADER_MARGIN_BOTTOM := float64(1)

	pdf.SetXY(refPoint.X, refPoint.Y)
	_, fontSize := pdf.GetFontSize()
	fontStyle := pdf.GetFontStyle()

	pdf.SetFontStyle("U")
	pdf.MultiCell(boxWidth, fontSize, strings.TrimRight(header, "\r\n"), "", "LT", false)

	pdf.SetXY(refPoint.X, refPoint.Y+fontSize+HEADER_MARGIN_BOTTOM)
	pdf.SetFontStyle(fontStyle)
	line := strings.Join(lines, "\n")

	pdf.MultiCell(boxWidth, fontSize, strings.TrimRight(line, "\r\n"), "", "LT", false)
}

func fillDayBoxes(marginTop, marginX, marginBottom float64, pdf *fpdf.Fpdf) {
	pdf.SetFont("Arial", "", 10)
	pageWidth, pageHeight, _ := pdf.PageSize(0)

	BOX_MARGIN_RIGHT := float64(1)
	BOX_MARGIN_Y := float64(1)

	header := "08/16/2024"
	lines := []string{
		"01:00 - 1:00 123 Street Ave",
		"02:00 - 1:00 123 Street Ave",
		"03:00 - 1:00 123 Street Ave",
		"04:00 - 1:00 123 Street Ave",
		"05:00 - 1:00 123 Street Ave",
		"06:00 - 1:00 123 Street Ave",
		"07:00 - 1:00 123 Street Ave",
		"08:00 - 1:00 123 Street Ave",
		"09:00 - 1:00 123 Street Ave",
		"10:00 - 1:00 123 Street Ave",
		"11:00 - 1:00 123 Street Ave",
		"12:00 - 1:00 123 Street Ave",
		"13:00 - 1:00 123 Street Ave",
		"14:00 - 1:00 123 Street Ave",
		"15:00 - 1:00 123 Street Ave",
		"16:00 - 1:00 123 Street Ave",
		"17:00 - 1:00 123 Street Ave",
		"18:00 - 1:00 123 Street Ave",
		"19:00 - 1:00 123 Street Ave",
		"20:00 - 1:00 123 Street Ave",
		"21:00 - 1:00 123 Street Ave",
		"22:00 - 1:00 123 Street Ave",
	}

	boxWidth := 0.5 * (pageWidth - 2*marginX)
	boxHeight := (pageHeight - marginTop - marginBottom) / 3

	// Filling in left column
	topLeft := vec2.Vec2{X: marginX, Y: marginTop}

	for idx := range 3 {
		point := vec2.Vec2{X: topLeft.X, Y: topLeft.Y + (float64(idx) * boxHeight) + BOX_MARGIN_Y}
		fillDayBox(point, boxWidth-BOX_MARGIN_RIGHT, boxHeight-BOX_MARGIN_Y, header, lines, pdf)
	}

	// Filling in top half of right column
	topLeft = vec2.Vec2{X: marginX + boxWidth, Y: marginTop}

	for idx := range 2 {
		point := vec2.Vec2{X: topLeft.X, Y: topLeft.Y + (float64(idx) * boxHeight) + BOX_MARGIN_Y}
		fillDayBox(point, boxWidth-BOX_MARGIN_RIGHT, boxHeight-BOX_MARGIN_Y, header, lines, pdf)
	}

	lines = []string{
		"01:00 - 1:00 123 Street Ave",
		"02:00 - 1:00 123 Street Ave",
		"03:00 - 1:00 123 Street Ave",
		"04:00 - 1:00 123 Street Ave",
		"05:00 - 1:00 123 Street Ave",
		"06:00 - 1:00 123 Street Ave",
		"07:00 - 1:00 123 Street Ave",
		"08:00 - 1:00 123 Street Ave",
		"09:00 - 1:00 123 Street Ave",
		"10:00 - 1:00 123 Street Ave",
	}

	// Filling in bottom half of right column
	topLeft = vec2.Vec2{X: marginX + boxWidth, Y: marginTop + 2*boxHeight}
	boxHeight = 0.5 * boxHeight

	for idx := range 2 {
		point := vec2.Vec2{X: topLeft.X, Y: topLeft.Y + (float64(idx) * boxHeight) + BOX_MARGIN_Y}
		fillDayBox(point, boxWidth-BOX_MARGIN_RIGHT, boxHeight-BOX_MARGIN_Y, header, lines, pdf)
	}
}
