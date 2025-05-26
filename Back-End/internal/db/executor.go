package db

import (
	"database/sql"
)

// The point of executors is to force errors when trying to use a *sqlx.Db to write to the database.
// This is because we want to use *sqlx.Db for reading only, and *sql.Tx for writing.

// Note that sqlx is not used in THIS package, but we use the library.
// sqlx wraps the standard database/sql package, and provides a set of methods that are more convenient to use.
// So there is no need to tightly couple the code to sqlx, but we can still use it.

// ReadDBExecutor is an interface that defines the methods that can be used to read from a database.
type ReadDBExecutor interface {
	Query(query string, args ...any) (*sql.Rows, error)
	QueryRow(string, ...any) *sql.Row

	Get(dest interface{}, query string, args ...any) error
	Select(dest interface{}, query string, args ...any) error
}

// WriteDBExecutor is an interface that defines the methods that can be used to write to a database.
type WriteDBExecutor interface {
	Exec(query string, args ...any) (sql.Result, error)
	ReadDBExecutor
}
