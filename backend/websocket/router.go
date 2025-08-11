package websocket

import (
	"net/http"
	repository "social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"

	"github.com/gorilla/mux"
)

// SetupWebSocketRoutes sets up all WebSocket-related routes and returns the Hub
func SetupWebSocketRoutes(
	router *mux.Router,
	messageRepo repository.MessageRepositoryInterface,
	conversationRepo repository.ConversationRepositoryInterface,
	conversationMembersRepo repository.ConversationMemberRepositoryInterface,
	groupRepo repository.GroupRepositoryInterface,
	eventRepo repository.EventRepositoryInterface,
	userRepo repository.UserRepositoryInterface,
) *Hub {
	// Create WebSocket handler
	wsHandler := NewWebSocketHandler(messageRepo, conversationRepo, conversationMembersRepo, groupRepo, eventRepo, userRepo)

	// WebSocket endpoints
	router.Handle("/ws", middlewares.JWTMiddleware(http.HandlerFunc(wsHandler.HandleWebSocket))).Methods("GET")
	router.Handle("/ws/groups", middlewares.JWTMiddleware(http.HandlerFunc(wsHandler.HandleGroupWebSocket))).Methods("GET")
	router.Handle("/ws/events", middlewares.JWTMiddleware(http.HandlerFunc(wsHandler.HandleEventWebSocket))).Methods("GET")

	apiRouter := router.PathPrefix("/api/messages").Subrouter()

	// Get or create conversation between two users
	apiRouter.HandleFunc("/conversation", wsHandler.HandleGetConversation).Methods("POST")
	
	// Additional WebSocket API routes
	router.HandleFunc("/api/users/online", wsHandler.GetOnlineUsers).Methods("GET")
	
	// 🎯 Retourner le Hub pour utilisation dans les handlers HTTP
	return wsHandler.hub
}
