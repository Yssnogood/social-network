package routes

import (
	"social-network/backend/server/handlers"

	"github.com/gorilla/mux"
)

// UserRoutes
func UserRoutes(r *mux.Router, userHandler *handlers.UserHandler) {
	r.HandleFunc("/api/register", userHandler.CreateUser).Methods("POST")
	r.HandleFunc("/api/login", userHandler.Login).Methods("POST")
	r.HandleFunc("/api/logout", userHandler.Logout).Methods("POST")

	r.HandleFunc("/api/users/{id}", userHandler.UpdateUser).Methods("PUT")
	r.HandleFunc("/api/users/{id}", userHandler.DeleteUser).Methods("DELETE")

	r.HandleFunc("/api/user", userHandler.GetCurrentUser).Methods("POST")
	r.HandleFunc("/api/user/{id}", userHandler.GetUser).Methods("POST")
}
