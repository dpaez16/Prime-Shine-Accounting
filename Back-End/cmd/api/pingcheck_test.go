package main

import (
	"bytes"
	"io"
	"net/http"
	"net/http/httptest"
	"prime-shine-api/internal/assert"
	"testing"
)

func TestPing(t *testing.T) {
	app := application{}
	rr := httptest.NewRecorder()

	r, err := http.NewRequest(http.MethodGet, "/ping", nil)
	if err != nil {
		t.Fatal(err)
	}

	app.pingCheckHandler(rr, r, nil)

	rs := rr.Result()

	assert.Equal(t, rs.StatusCode, http.StatusOK)

	defer rs.Body.Close()
	body, err := io.ReadAll(rs.Body)
	if err != nil {
		t.Fatal(err)
	}

	bytes.TrimSpace(body)

	assert.Equal(t, string(body), "pong")
}
