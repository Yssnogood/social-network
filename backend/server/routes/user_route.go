package routes

import (
	"social-network/backend/server/handlers"
	"github.com/gorilla/mux"
)
// UserRoutes
func UserRoutes(r *mux.Router, userHandler *handlers.UserHandler) {
	r.HandleFunc("/api/users", userHandler.CreateUser).Methods("POST")
	// r.HandleFunc("/api/users/{id}", userHandler.GetUser).Methods("GET")
	// r.HandleFunc("/api/users/{id}", userHandler.UpdateUser).Methods("PUT")
	// r.HandleFunc("/api/users/{id}", userHandler.DeleteUser).Methods("DELETE")
}

