package websocket

import (
	"net/http"
	repository "social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"

	"github.com/gorilla/mux"
)

// SetupWebSocketRoutes sets up all WebSocket-related routes
func SetupWebSocketRoutes(
	router *mux.Router,
	messageRepo repository.MessageRepositoryInterface,
	conversationRepo repository.ConversationRepositoryInterface,
	conversationMembersRepo repository.ConversationMemberRepositoryInterface,
	notificationRepo repository.NotificationRepositoryInterface,
) {
	// Create WebSocket handler
	wsHandler := NewWebSocketHandler(messageRepo, conversationRepo, conversationMembersRepo, notificationRepo)

	// WebSocket endpoint
	router.Handle("/ws", middlewares.JWTMiddleware(http.HandlerFunc(wsHandler.HandleWebSocket))).Methods("GET")

	apiRouter := router.PathPrefix("/api/messages").Subrouter()

	// Get or create conversation between two users
	apiRouter.HandleFunc("/conversation", wsHandler.HandleGetConversation).Methods("POST")
}
