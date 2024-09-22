.PHONY: tests

run:
	go run ./cmd/api

install-deps:
	go mod tidy

get-deps:
	go mod download

tests:
	go test -v ./cmd/api/
