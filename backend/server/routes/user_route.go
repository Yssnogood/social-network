package routes

import (
	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"

	"net/http"

	"github.com/gorilla/mux"
)

// UserRoutes
func UserRoutes(r *mux.Router, userHandler *handlers.UserHandler) {
	r.HandleFunc("/api/register", userHandler.CreateUser).Methods("POST")
	r.HandleFunc("/api/login", userHandler.Login).Methods("POST")
	r.HandleFunc("/api/logout", userHandler.Logout).Methods("POST")
	r.HandleFunc("/api/search", userHandler.Search).Methods("POST")

	r.HandleFunc("/api/users/{id}", userHandler.UpdateUser).Methods("PUT")
	//r.HandleFunc("/api/users/{id}", userHandler.DeleteUser).Methods("DELETE")

	r.HandleFunc("/api/user", userHandler.GetCurrentUser).Methods("POST")
	r.HandleFunc("/api/user/{id}", userHandler.GetUser).Methods("POST")
	r.HandleFunc("/api/users/search/{name}/{current}", userHandler.SearchUsers).Methods("GET")
	r.Handle("/api/users/friends", middlewares.JWTMiddleware(http.HandlerFunc(userHandler.GetUserFriends))).Methods("GET", "OPTIONS")
	r.Handle("/api/users/following", middlewares.JWTMiddleware(http.HandlerFunc(userHandler.GetFollowingUsers))).Methods("GET", "OPTIONS")
	r.Handle("/api/users/all-with-status", middlewares.JWTMiddleware(http.HandlerFunc(userHandler.GetAllUsersWithStatus))).Methods("GET", "OPTIONS")
	// get user by JWT
	r.Handle("/api/users/me", middlewares.JWTMiddleware(http.HandlerFunc(userHandler.GetCurrentUser))).Methods("GET")
}
