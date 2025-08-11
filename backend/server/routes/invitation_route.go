package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"
)

func InvitationRoutes(r *mux.Router, invitationHandler *handlers.InvitationHandler) {
	// Get received invitations for a user
	r.Handle("/api/users/{id:[0-9]+}/invitations/received", middlewares.JWTMiddleware(http.HandlerFunc(invitationHandler.GetUserReceivedInvitations))).Methods("GET", "OPTIONS")
	
	// Get sent invitations by a user
	r.Handle("/api/users/{id:[0-9]+}/invitations/sent", middlewares.JWTMiddleware(http.HandlerFunc(invitationHandler.GetUserSentInvitations))).Methods("GET", "OPTIONS")
	
	// Respond to an invitation (accept or decline)
	r.Handle("/api/invitations/{id:[0-9]+}/respond", middlewares.JWTMiddleware(http.HandlerFunc(invitationHandler.RespondToInvitation))).Methods("POST", "OPTIONS")
	
	// Cancel an invitation (for the sender)
	r.Handle("/api/invitations/{id:[0-9]+}/cancel", middlewares.JWTMiddleware(http.HandlerFunc(invitationHandler.CancelInvitation))).Methods("DELETE", "OPTIONS")
}