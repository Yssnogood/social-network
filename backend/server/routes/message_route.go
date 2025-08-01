package routes

import (
	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"

	"net/http"

	"github.com/gorilla/mux"
)

func MessageRoutes(r *mux.Router, messageHandler *handlers.MessageHandler) {
	r.Handle("/api/messages", middlewares.CORSMiddleware(middlewares.JWTMiddleware(
		http.HandlerFunc(messageHandler.CreateMessage)))).Methods("POST", "OPTIONS")

	r.Handle("/api/messages/{id}", middlewares.CORSMiddleware(middlewares.JWTMiddleware(
		http.HandlerFunc(messageHandler.GetMessageByID)))).Methods("GET", "OPTIONS")

	r.Handle("/api/messages/{id}", middlewares.CORSMiddleware(middlewares.JWTMiddleware(
		http.HandlerFunc(messageHandler.UpdateMessage)))).Methods("PUT", "OPTIONS")

	r.Handle("/api/messages/{id}", middlewares.CORSMiddleware(middlewares.JWTMiddleware(
		http.HandlerFunc(messageHandler.DeleteMessage)))).Methods("DELETE", "OPTIONS")

	r.Handle("/api/messages", middlewares.CORSMiddleware(middlewares.JWTMiddleware(
		http.HandlerFunc(messageHandler.GetMessagesByConversationID)))).Methods("GET", "OPTIONS")
	r.Handle("/api/messages/user/conversations", middlewares.CORSMiddleware(middlewares.JWTMiddleware(
		http.HandlerFunc(messageHandler.GetUserConversation)))).Methods("GET")

}
