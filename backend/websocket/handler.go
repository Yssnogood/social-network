package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	repository "social-network/backend/database/repositories"
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

// HandleGetConversation handles HTTP requests to get or create conversation between two users
func (h *WebSocketHandler) HandleGetConversation(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("🔥 Panic récupérée: %+v\n", r)
		}
	}()

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		InitiatorID int64 `json:"initiator_id"`
		RecipientID int64 `json:"recipient_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.InitiatorID == 0 || req.RecipientID == 0 {
		http.Error(w, "Both user IDs are required", http.StatusBadRequest)
		return
	}

	// Log pour debug
	log.Printf("💬 Demande conversation entre initiateur %d et receveur %d", req.InitiatorID, req.RecipientID)

	conversation, err := h.conversationRepo.CreateOrGetPrivateConversation(req.InitiatorID, req.RecipientID)
	if err != nil {
		log.Println("❌ Erreur CreateOrGetPrivateConversation:", err)
		http.Error(w, "Failed to get/create conversation", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversation)
}

// GetConversationMessages retrieves messages for a conversation
func (h *WebSocketHandler) GetConversationMessages(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("🔥 Panic récupérée: %+v\n", r)
		}
	}()
	cookie, err := r.Cookie("jwt")
	if err != nil {
		http.Error(w, "No Credentials", http.StatusForbidden)
	}
	middlewares.CheckJWT(cookie.Value)

	conversationID := r.URL.Query().Get("conversation_id")
	fmt.Println("test error oéne")
	if conversationID == "" {
		http.Error(w, "Conversation ID is required", http.StatusBadRequest)
		return
	}

	cid, err := strconv.ParseInt(conversationID, 10, 64)
	if err != nil {
		http.Error(w, "Invalid conversation ID", http.StatusBadRequest)
		return
	}

	messages, err := h.messageRepo.GetMessagesByConversationID(cid)
	if err != nil {
		log.Println("❌ Erreur GetMessagesByConversationID:", err)
		http.Error(w, "Failed to retrieve messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}
