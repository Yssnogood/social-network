package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"
)

func GroupRoutes(r *mux.Router, groupHandler *handlers.GroupHandler) {
	r.Handle("/api/groups", middlewares.JWTMiddleware(http.HandlerFunc(groupHandler.CreateGroup))).Methods("POST", "OPTIONS")
}