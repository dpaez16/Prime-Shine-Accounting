package mocks

import (
	"io"
	"log"
)

func MockLogger() *log.Logger {
	return log.New(io.Discard, "", 0)
}
