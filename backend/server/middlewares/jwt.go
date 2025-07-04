package middlewares

import (
	"context"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
)

var JwtSecret = []byte("ton_secret_jwt")

type contextKey string

const UserIDKey contextKey = "userID"

func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var tokenString string

		// Essaye d'abord de lire le token depuis le cookie
		cookie, err := r.Cookie("jwt")
		if err == nil {
			tokenString = cookie.Value
		} else {
			// Sinon, essaie de lire depuis l'en-tête Authorization
			authHeader := r.Header.Get("Authorization")
			if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				tokenString = authHeader[7:]
			} else {
				http.Error(w, "Token JWT manquant", http.StatusUnauthorized)
				return
			}
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return JwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Token JWT invalide", http.StatusUnauthorized)
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		userID := int64(claims["user_id"].(float64))

		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetUserID(r *http.Request) (int64, bool) {
	userID, ok := r.Context().Value(UserIDKey).(int64)
	return userID, ok
}
