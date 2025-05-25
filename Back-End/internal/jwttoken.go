package internal

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pkg/errors"
)

const JWT_ISSUER = "prime-shine-api"

func getJWTSecret() []byte {
	return []byte(os.Getenv("JWT_TOKEN"))
}

// Creates a signed JSON Web Token for a user session.
func CreateToken(userID string) (string, error) {
	jwtKey := getJWTSecret()
	currentTime := jwt.NewNumericDate(time.Now())
	expirationDate := jwt.NewNumericDate(time.Now().Add(4 * time.Hour))

	claims := jwt.MapClaims{
		"sub": userID,
		"iat": currentTime,
		"nbf": currentTime,
		"exp": expirationDate,
		"iss": JWT_ISSUER,
		"aud": []string{JWT_ISSUER},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedJWT, err := token.SignedString(jwtKey)
	if err != nil {
		return "", errors.Wrap(err, "SignedString")
	}

	return signedJWT, err
}

func verifyHelper(token *jwt.Token) (interface{}, error) {
	if token.Method != jwt.SigningMethodHS256 {
		return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
	}

	jwtKey := getJWTSecret()
	return jwtKey, nil
}

// Verifies a JSON Web Token.
func VerifyToken(tokenStr string) (bool, error) {
	token, err := jwt.Parse(tokenStr, verifyHelper, jwt.WithoutClaimsValidation())
	if err != nil {
		return false, errors.Wrap(err, "jwt.Parse")
	}

	if issuer, err := token.Claims.GetIssuer(); err != nil || issuer != JWT_ISSUER {
		return false, errors.Wrap(err, "GetIssuer")
	}

	nbt, err := token.Claims.GetNotBefore()
	if err != nil {
		return false, errors.Wrap(err, "GetNotBefore")
	}

	exp, err := token.Claims.GetExpirationTime()
	if err != nil {
		return false, errors.Wrap(err, "GetExpirationTime")
	}

	currentTime := time.Now()
	if nbt.After(currentTime) || exp.Before(currentTime) {
		return false, nil
	}

	return token.Valid, nil
}
