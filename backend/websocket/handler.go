package websocket

import (
	"encoding/json"
	"net/http"
	"social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
	"strconv"
)

// WebSocketHandler handles WebSocket connections and HTTP requests
type WebSocketHandler struct {
	hub                     *Hub
	messageRepo             repository.MessageRepositoryInterface
	conversationRepo        repository.ConversationRepositoryInterface
	conversationMembersRepo repository.ConversationMemberRepositoryInterface
}

// NewWebSocketHandler creates a new WebSocket handler
func NewWebSocketHandler(
	messageRepo repository.MessageRepositoryInterface,
	conversationRepo repository.ConversationRepositoryInterface,
	conversationMembersRepo repository.ConversationMemberRepositoryInterface,
) *WebSocketHandler {
	hub := NewHub(messageRepo, conversationRepo, conversationMembersRepo)
	go hub.Run()

	return &WebSocketHandler{
		hub:                     hub,
		messageRepo:             messageRepo,
		conversationRepo:        conversationRepo,
		conversationMembersRepo: conversationMembersRepo,
	}
}

// HandleWebSocket handles WebSocket connection requests
func (h *WebSocketHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	userID, ok := middlewares.GetUserID(r)
	if !ok {
		http.Error(w, "Non autorisé", http.StatusUnauthorized)
		return
	}

	ServeWS(h.hub, w, r, userID)
}

// HandleGetMessages handles HTTP requests to get message history between two users
func (h *WebSocketHandler) HandleGetMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user IDs from query parameters
	user1IDStr := r.URL.Query().Get("user1_id")
	user2IDStr := r.URL.Query().Get("user2_id")

	if user1IDStr == "" || user2IDStr == "" {
		http.Error(w, "Both user IDs are required", http.StatusBadRequest)
		return
	}

	user1ID, err := strconv.ParseInt(user1IDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid user1_id", http.StatusBadRequest)
		return
	}

	user2ID, err := strconv.ParseInt(user2IDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid user2_id", http.StatusBadRequest)
		return
	}

	// Get messages between users
	messages, err := h.messageRepo.GetMessagesBetweenUsers(user1ID, user2ID)
	if err != nil {
		http.Error(w, "Failed to get messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// HandleGetConversation handles HTTP requests to get or create conversation between two users
func (h *WebSocketHandler) HandleGetConversation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		User1ID int64 `json:"user1_id"`
		User2ID int64 `json:"user2_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.User1ID == 0 || req.User2ID == 0 {
		http.Error(w, "Both user IDs are required", http.StatusBadRequest)
		return
	}

	// Get or create conversation
	conversation, err := h.conversationRepo.CreateOrGetPrivateConversation(req.User1ID, req.User2ID)
	if err != nil {
		http.Error(w, "Failed to get/create conversation", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversation)
}
