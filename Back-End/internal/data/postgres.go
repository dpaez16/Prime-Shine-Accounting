package data

import (
	"os"

	"github.com/jackc/pgx"
	"github.com/pkg/errors"
)

func ConnectDB_PG() (*pgx.Conn, error) {
	connection, err := pgx.Connect(pgx.ConnConfig{
		Host:     os.Getenv("POSTGRES_HOST"),
		Database: os.Getenv("POSTGRES_DB"),
		User:     os.Getenv("POSTGRES_USER"),
		Password: os.Getenv("POSTGRES_PASSWORD"),
	})

	if err != nil {
		return nil, errors.Wrap(err, "pgx.Connect")
	}

	return connection, nil
}
