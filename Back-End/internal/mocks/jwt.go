package mocks

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pkg/errors"
)

func getMockJWTSecret() []byte {
	return []byte(os.Getenv("JWT_TOKEN"))
}

func ExpiredJWT(userID string) (string, error) {
	jwtKey := getMockJWTSecret()
	currentTime := jwt.NewNumericDate(time.Now())
	expirationDate := jwt.NewNumericDate(time.Now())

	claims := jwt.MapClaims{
		"sub": userID,
		"iat": currentTime,
		"nbf": currentTime,
		"exp": expirationDate,
		"iss": "prime-shine-api",
		"aud": []string{"prime-shine-api"},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedJWT, err := token.SignedString(jwtKey)
	if err != nil {
		return "", errors.Wrap(err, "SignedString")
	}

	return signedJWT, err
}
