package data

import (
	"database/sql"
	"fmt"
	"prime-shine-api/internal"
	"prime-shine-api/internal/db"
	"strings"

	"github.com/pkg/errors"
)

type User struct {
	ID       int    `db:"userid" json:"_id"`
	Name     string `db:"name" json:"name"`
	Email    string `db:"email" json:"email"`
	Password string `db:"password" json:"-"`
}

// Finds one user.
// If a runtime error occurs, a nil user and error is returned.
// Otherwise, a user and nil error is returned.
func FindOneUser(readConn db.ReadDBExecutor, filter map[string]any) (*User, error) {
	user := &User{}

	var args []any
	var whereClauses []string

	for k, v := range filter {
		argNum := len(args) + 1
		whereClause := fmt.Sprintf("%v = $%v", k, argNum)

		if k == "userid" || k == "email" {
			whereClauses = append(whereClauses, whereClause)
			args = append(args, v)
		}
	}

	query := fmt.Sprintf(`
		SELECT *
		  FROM users
		 WHERE %v
	`, strings.Join(whereClauses, " AND "))

	err := readConn.Get(user, query, args...)
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, errors.Wrap(err, "Get")
	}

	return user, nil
}

// Searches for a user in the context of logging in.
// If a runtime error occurs, a nil user and error is returned.
// Otherwise, a user and nil error is returned.
func QueryUserAndPassword(readConn db.ReadDBExecutor, email string, password string) (*User, error) {
	filter := map[string]any{"email": email}
	user, err := FindOneUser(readConn, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneUser")
	}

	if user == nil {
		return nil, nil
	}

	passwordValid, err := internal.ComparePasswords([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.Wrap(err, "ComparePasswords")
	}

	if passwordValid {
		return user, nil
	} else {
		return nil, nil
	}
}

// Creates a new user.
func CreateUser(tx db.WriteDBExecutor, name string, email string, password string) (*User, error) {
	filter := map[string]any{"email": email}
	foundUser, err := FindOneUser(tx, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneUser")
	}

	if foundUser != nil {
		return nil, errors.New("User already exists.")
	}

	hashedPassword, err := internal.HashPassword(password)
	if err != nil {
		return nil, errors.Wrap(err, "HashPassword")
	}

	result, err := tx.Exec(`
		INSERT INTO users
		(name, email, password)
		VALUES ($1, $2, $3)
	`, name, email, string(hashedPassword))

	if err != nil {
		return nil, errors.Wrap(err, "tx.Exec")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, errors.Wrap(err, "RowsAffected")
	}

	if rowsAffected != 1 {
		return nil, errors.New("failed to insert users entry")
	}

	// Grab the newly created user
	newUser, err := FindOneUser(tx, map[string]any{"email": email})
	if err != nil {
		return nil, errors.Wrap(err, "FindOneUser")
	}

	return newUser, nil
}

// Edits a user.
func EditUser(tx db.WriteDBExecutor, userID int, newEmail string, newName string, newPassword string) (*User, error) {
	hashedPassword, err := internal.HashPassword(newPassword)
	if err != nil {
		return nil, errors.Wrap(err, "HashPassword")
	}

	filter := map[string]any{"userid": userID}
	user, err := FindOneUser(tx, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneUser")
	}

	if user == nil {
		return nil, errors.New("Unable to find user.")
	}

	if user.Email != newEmail {
		filter = map[string]any{"email": newEmail}
		foundUser, err := FindOneUser(tx, filter)
		if err != nil {
			return nil, errors.Wrap(err, "FindOneUser")
		}

		if foundUser != nil {
			return nil, errors.New("User with that email exists.")
		}
	}

	user.ID = userID
	user.Name = newName
	user.Email = newEmail
	user.Password = string(hashedPassword)

	result, err := tx.Exec(`
		UPDATE users
		SET   name     = $1
		    , email    = $2
			, password = $3
		WHERE userid = $4
	`, user.Name, user.Email, user.Password, user.ID)

	if err != nil {
		return nil, errors.Wrap(err, "tx.Exec")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, errors.Wrap(err, "RowsAffected")
	}

	if rowsAffected == 0 {
		return nil, errors.New("user was not mutated")
	}

	return user, nil
}

// Deletes a user.
func DeleteUser(tx db.WriteDBExecutor, userID int) (bool, error) {
	filter := map[string]any{"userid": userID}
	user, err := FindOneUser(tx, filter)
	if err != nil {
		return false, errors.Wrap(err, "FindOneUser")
	}

	if user == nil {
		return false, errors.New("User not found.")
	}

	_, err = tx.Exec(`
		DELETE FROM users
		WHERE userid = $1
	`, userID)

	if err != nil {
		return false, errors.Wrap(err, "tx.Exec")
	}

	return true, nil
}
