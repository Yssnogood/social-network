package routes

import (
	"net/http"

	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"
	"github.com/gorilla/mux"
)
// UserRoutes

func EventsRoutes(r *mux.Router, eventHandler *handlers.EventHandler) {
	r.Handle("/api/groups/{id:[0-9]+}/events", middlewares.JWTMiddleware(http.HandlerFunc(eventHandler.CreateEvent))).Methods("POST", "OPTIONS")
	r.Handle("/api/events/{eventID:[0-9]+}/response", middlewares.JWTMiddleware(http.HandlerFunc(eventHandler.SetEventResponse))).Methods("POST", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/events", middlewares.JWTMiddleware(http.HandlerFunc(eventHandler.GetEventsByGroupID))).Methods("GET", "OPTIONS")
}


