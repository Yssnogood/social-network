package websocket

import (
	"social-network/backend/database/repositories"

	"github.com/gorilla/mux"
)

// SetupWebSocketRoutes sets up all WebSocket-related routes
func SetupWebSocketRoutes(
	router *mux.Router,
	messageRepo repository.MessageRepositoryInterface,
	conversationRepo repository.ConversationRepositoryInterface,
	conversationMembersRepo repository.ConversationMemberRepositoryInterface,
) {
	// Create WebSocket handler
	wsHandler := NewWebSocketHandler(messageRepo, conversationRepo, conversationMembersRepo)

	// WebSocket endpoint
	router.HandleFunc("/ws", wsHandler.HandleWebSocket).Methods("GET")

	// API endpoints for message history and conversation management
	apiRouter := router.PathPrefix("/api/messages").Subrouter()

	// Get message history between two users
	apiRouter.HandleFunc("/history", wsHandler.HandleGetMessages).Methods("GET")

	// Get or create conversation between two users
	apiRouter.HandleFunc("/conversation", wsHandler.HandleGetConversation).Methods("POST")
}