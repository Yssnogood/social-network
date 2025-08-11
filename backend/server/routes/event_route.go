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
	r.Handle("/api/events/{eventID:[0-9]+}/responses", middlewares.JWTMiddleware(http.HandlerFunc(eventHandler.GetEventResponses))).Methods("GET", "OPTIONS")
	r.Handle("/api/groups/{id:[0-9]+}/events", middlewares.JWTMiddleware(http.HandlerFunc(eventHandler.GetEventsByGroupID))).Methods("GET", "OPTIONS")
	r.Handle("/api/events/{eventID:[0-9]+}", middlewares.JWTMiddleware(http.HandlerFunc(eventHandler.DeleteEvent))).Methods("DELETE", "OPTIONS")
	
	// Message routes
	r.Handle("/api/events/{eventID:[0-9]+}/messages", middlewares.JWTMiddleware(http.HandlerFunc(eventHandler.CreateEventMessage))).Methods("POST", "OPTIONS")
	r.Handle("/api/events/{eventID:[0-9]+}/messages", middlewares.JWTMiddleware(http.HandlerFunc(eventHandler.GetEventMessages))).Methods("GET", "OPTIONS")
}


