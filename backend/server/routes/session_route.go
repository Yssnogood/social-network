package routes

import (
	"social-network/backend/server/handlers"
	"github.com/gorilla/mux"
)
// UserRoutes

func SessionsRoutes(r *mux.Router, sessionHandler *handlers.SessionHandler) {
	r.HandleFunc("/api/sessions", sessionHandler.CreateSession).Methods("POST")
	r.HandleFunc("/api/sessions/{id}", sessionHandler.GetSessionByID).Methods("GET")
	r.HandleFunc("/api/sessions/{id}", sessionHandler.UpdateSession).Methods("PUT")
	r.HandleFunc("/api/sessions/{id}", sessionHandler.DeleteSession).Methods("DELETE")
}

