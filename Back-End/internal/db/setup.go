package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"

	_ "github.com/jackc/pgx"
)

func getDBConnectionURL() string {
	host := os.Getenv("POSTGRES_HOST")
	database := os.Getenv("POSTGRES_DB")
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")

	return fmt.Sprintf(
		"postgres://%v:%v@%v:%v/%v",
		user,
		password,
		host,
		5432, // default PostgreSQL port
		database,
	)
}

func SetupDB(logger *log.Logger) (*sqlx.DB, error) {
	conn, err := connectToDb(logger, getDBConnectionURL())
	if err != nil {
		return nil, errors.Wrap(err, "connect to database")
	}

	conn.SetConnMaxIdleTime(5 * time.Second)
	conn.SetMaxIdleConns(5)

	return conn, nil
}

func connectToDb(logger *log.Logger, dsn string) (*sqlx.DB, error) {
	connDb, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, errors.Wrap(err, "open database connection")
	}

	// TODO: Add logs to queries
	conn := sqlx.NewDb(connDb, "postgres")

	err = conn.Ping()
	if err != nil {
		return nil, errors.Wrap(err, "ping database")
	}

	logger.Println("Connected to database")

	return conn, nil
}
