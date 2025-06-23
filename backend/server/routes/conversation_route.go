package routes

import (
	"social-network/backend/server/handlers"

	"github.com/gorilla/mux"
)

// UserRoutes

func ConversationsRoutes(r *mux.Router, conversationHandler *handlers.ConversationHandler) {
	r.HandleFunc("/api/conversation", conversationHandler.CreateConversation).Methods("POST")
}
