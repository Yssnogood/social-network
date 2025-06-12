package routes

import (
	"social-network/backend/server/handlers"
	"github.com/gorilla/mux"
)
// UserRoutes

func EventsRoutes(r *mux.Router, eventHandler *handlers.EventHandler) {
	r.HandleFunc("/api/events", eventHandler.CreateEvent).Methods("POST")
	r.HandleFunc("/api/events/{id}", eventHandler.GetEventByID).Methods("GET")
	r.HandleFunc("/api/events/{id}", eventHandler.UpdateEvent).Methods("PUT")
	r.HandleFunc("/api/events/{id}", eventHandler.DeleteEvent).Methods("DELETE")
}


