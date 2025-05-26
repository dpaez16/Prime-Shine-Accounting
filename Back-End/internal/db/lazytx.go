package db

import (
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// LazyTx is a struct that supports both read and write operations, starting a transaction lazily
type LazyTx struct {
	db      *sqlx.DB
	tx      *sqlx.Tx
	started bool
}

// Creates a new LazyTx instance
func NewLazyTx(db *sqlx.DB) *LazyTx {
	return &LazyTx{db: db}
}

// Lazily starts a transaction if it hasn't been started yet
func (lt *LazyTx) beginTx() error {
	if !lt.started {
		tx, err := lt.db.Beginx()
		if err != nil {
			return errors.Wrap(err, "sqlx begin transaction")
		}
		lt.tx = tx
		lt.started = true
	}
	return nil
}

// Commits the transaction if it was started
func (lt *LazyTx) Commit() error {
	if lt.started {
		return lt.tx.Commit()
	}
	return nil
}

// Rolls back the transaction if it was started
func (lt *LazyTx) Rollback() error {
	if lt.started {
		return lt.tx.Rollback()
	}
	return nil
}

// Get implements the ReadDBExecutor interface and can work with either tx or db
func (lt *LazyTx) Get(dest interface{}, query string, args ...interface{}) error {
	if lt.started {
		return lt.tx.Get(dest, query, args...)
	}
	return lt.db.Get(dest, query, args...)
}

// Query implements the ReadDBExecutor interface and can work with either tx or db
func (lt *LazyTx) Query(query string, args ...interface{}) (*sql.Rows, error) {
	if lt.started {
		return lt.tx.Query(query, args...)
	}
	return lt.db.Query(query, args...)
}

// QueryRow implements the ReadDBExecutor interface and can work with either tx or db
func (lt *LazyTx) QueryRow(query string, args ...interface{}) *sql.Row {
	if lt.started {
		return lt.tx.QueryRow(query, args...)
	}
	return lt.db.QueryRow(query, args...)
}

// Exec implements the WriteDBExecutor interface, lazily starting a transaction if necessary
func (lt *LazyTx) Exec(query string, args ...interface{}) (sql.Result, error) {
	if err := lt.beginTx(); err != nil {
		return nil, err
	}
	return lt.tx.Exec(query, args...)
}

func (lt *LazyTx) Select(dest interface{}, query string, args ...interface{}) error {
	if lt.started {
		return lt.tx.Select(dest, query, args...)
	}
	return lt.db.Select(dest, query, args...)
}
