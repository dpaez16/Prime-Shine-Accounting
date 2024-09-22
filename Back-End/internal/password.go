package internal

import (
	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

// Generates a hashed password.
func HashPassword(password string) ([]byte, error) {
	BCRYPT_SALT := 12
	hash, err := bcrypt.GenerateFromPassword([]byte(password), BCRYPT_SALT)
	return hash, err
}

// Compares a hashed password with a plaintext equivalent.
// If the password is correct/incorrect, a nil error is returned.
// An error is returned if a runtime error occurs with password comparasion.
func ComparePasswords(hashedPassword []byte, plaintextPassword []byte) (bool, error) {
	err := bcrypt.CompareHashAndPassword(hashedPassword, plaintextPassword)

	if err != nil {
		switch {
		case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
			return false, nil
		default:
			return false, errors.Wrap(err, "CompareHashAndPassword")
		}
	}

	return true, nil
}
