package services

import (
	"database/sql"
	"errors"
	"regexp"
	"golang.org/x/crypto/bcrypt"
	"time"
	"github.com/golang-jwt/jwt/v5"
)

// UserService is a service for managing users.
type UserService struct {
	db *sql.DB
}

// NewUserService creates a new UserService.
func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// ValidateEmail checks if the given email is valid.
func (s *UserService) ValidateEmail(email string) error {
	if !emailRegex.MatchString(email) {
		return errors.New("email invalide")
	}
	return nil
}

// hashPassword hashes the given password using bcrypt.
func (s *UserService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// checkPasswordHash checks if the given password matches the hashed password.
func (s *UserService) CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

var jwtSecret = []byte("ton_secret_jwt")

func (s *UserService) GenerateJWT(userID int64) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}