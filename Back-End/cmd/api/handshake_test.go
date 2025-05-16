package main

import (
	"log"
	"net/http"
	"net/http/httptest"
	"prime-shine-api/internal"
	"prime-shine-api/internal/assert"
	"prime-shine-api/internal/mocks"
	"testing"
)

func TestHandshakeNoToken(t *testing.T) {
	app := application{}
	rr := httptest.NewRecorder()

	r, err := http.NewRequest(http.MethodPost, "/handshake", nil)
	if err != nil {
		t.Fatal(err)
	}

	app.authenticate(app.handshakeHandler)(rr, r, nil)

	rs := rr.Result()

	assert.Equal(t, rs.StatusCode, http.StatusUnauthorized)
}

func TestHandshakeInvalidToken(t *testing.T) {
	app := application{
		logger: mocks.Logger(),
	}
	rr := httptest.NewRecorder()

	r, err := http.NewRequest(http.MethodPost, "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	r.Header.Add("Authorization", "invalidJWT")
	app.authenticate(app.pingCheckHandler)(rr, r, nil)

	rs := rr.Result()

	assert.Equal(t, rs.StatusCode, http.StatusInternalServerError)
}

func TestAuthenticationValidToken(t *testing.T) {
	app := application{
		logger: log.Default(),
	}
	rr := httptest.NewRecorder()

	r, err := http.NewRequest(http.MethodPost, "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	token, err := internal.CreateToken("1234")
	if err != nil {
		t.Fatal(err)
	}

	r.Header.Add("Authorization", token)
	app.authenticate(app.pingCheckHandler)(rr, r, nil)

	rs := rr.Result()

	assert.Equal(t, rs.StatusCode, http.StatusOK)
}
