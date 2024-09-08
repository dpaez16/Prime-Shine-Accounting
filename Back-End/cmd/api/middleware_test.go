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

func TestAuthenticationNoJWT(t *testing.T) {
	app := application{}
	rr := httptest.NewRecorder()

	r, err := http.NewRequest(http.MethodPost, "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	app.authenticate(app.pingCheckHandler)(rr, r, nil)

	rs := rr.Result()

	assert.Equal(t, rs.StatusCode, http.StatusUnauthorized)
}

func TestAuthenticationInvalidJWTServerError(t *testing.T) {
	app := application{
		logger: mocks.MockLogger(),
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

func TestAuthenticationInvalidJWTClientError(t *testing.T) {
	app := application{
		logger: log.Default(),
	}
	rr := httptest.NewRecorder()

	r, err := http.NewRequest(http.MethodPost, "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	token, err := mocks.CreateExpiredJWT("1234")
	if err != nil {
		t.Fatal(err)
	}

	r.Header.Add("Authorization", token)
	app.authenticate(app.pingCheckHandler)(rr, r, nil)

	rs := rr.Result()

	assert.Equal(t, rs.StatusCode, http.StatusUnauthorized)
}

func TestAuthenticationValidJWT(t *testing.T) {
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
