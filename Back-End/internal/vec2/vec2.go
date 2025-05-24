package vec2

import "math"

type Vec2 struct {
	X float64
	Y float64
}

func Midpoint(a, b Vec2) Vec2 {
	return Vec2{
		X: 0.5 * (a.X + b.X),
		Y: 0.5 * (a.Y + b.Y),
	}
}

func Distance(a, b Vec2) float64 {
	xDiff := a.X - b.X
	yDiff := a.Y - b.Y

	return math.Sqrt((xDiff * xDiff) + (yDiff * yDiff))
}
