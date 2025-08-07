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
	groupRepo repository.GroupRepositoryInterface,
	userRepo repository.UserRepositoryInterface,
) {
	// Create WebSocket handler
	wsHandler := NewWebSocketHandler(messageRepo, conversationRepo, conversationMembersRepo, groupRepo, userRepo)

	// WebSocket endpoints
	router.Handle("/ws", middlewares.JWTMiddleware(http.HandlerFunc(wsHandler.HandleWebSocket))).Methods("GET")
	router.Handle("/ws/groups", middlewares.JWTMiddleware(http.HandlerFunc(wsHandler.HandleGroupWebSocket))).Methods("GET")

	apiRouter := router.PathPrefix("/api/messages").Subrouter()

	// Get or create conversation between two users
	apiRouter.HandleFunc("/conversation", wsHandler.HandleGetConversation).Methods("POST")
	
	// Additional WebSocket API routes
	router.HandleFunc("/api/users/online", wsHandler.GetOnlineUsers).Methods("GET")
}
