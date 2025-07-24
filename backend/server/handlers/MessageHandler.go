package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/backend/database/models"
	repository "social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
	"strconv"
	"time"
)

type MessageHandler struct {
	MessageRepository             *repository.MessageRepository
	ConversationRepository        *repository.ConversationRepository
	ConversationMembersRepository *repository.ConversationMembersRepository
}

func NewMessageHandler(
	mr *repository.MessageRepository,
	cr *repository.ConversationRepository,
	cmr *repository.ConversationMembersRepository,
) *MessageHandler {
	return &MessageHandler{
		MessageRepository:             mr,
		ConversationRepository:        cr,
		ConversationMembersRepository: cmr,
	}
}

// Request DTOs

type createMessageRequest struct {
	ConversationID int64  `json:"conversation_id"`
	SenderID       int64  `json:"sender_id"`
	ReceiverID     int64  `json:"receiver_id"`
	GroupID        *int64 `json:"group_id,omitempty"`
	Content        string `json:"content"`
}

type getMessageByIDRequest struct {
	ID int64 `json:"id"`
}

type getMessagesBetweenUsersRequest struct {
	User1ID int64 `json:"user1_id"`
	User2ID int64 `json:"user2_id"`
}

type updateMessageRequest struct {
	ID      int64      `json:"id"`
	Content string     `json:"content"`
	ReadAt  *time.Time `json:"read_at,omitempty"`
}

type deleteMessageRequest struct {
	ID int64 `json:"id"`
}

type getUserConversationRequest struct {
	JWT string `json:"jwt"`
}

// Handlers

// CreateMessage creates a new message.
func (h *MessageHandler) CreateMessage(w http.ResponseWriter, r *http.Request) {
	var req createMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	message := &models.Message{
		ConversationID: req.ConversationID,
		SenderID:       req.SenderID,
		ReceiverID:     req.ReceiverID,
		GroupID:        req.GroupID,
		Content:        req.Content,
		CreatedAt:      time.Now(),
	}

	id, err := h.MessageRepository.Create(message)
	if err != nil {
		http.Error(w, "Failed to create message", http.StatusInternalServerError)
		return
	}

	message.ID = id
	json.NewEncoder(w).Encode(message)
}

// GetMessageByID retrieves a message by its ID.
func (h *MessageHandler) GetMessageByID(w http.ResponseWriter, r *http.Request) {
	var req getMessageByIDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	message, err := h.MessageRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "Message not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(message)
}

// GetMessagesBetweenUsers returns messages between two users.
func (h *MessageHandler) GetMessagesBetweenUsers(w http.ResponseWriter, r *http.Request) {
	var req getMessagesBetweenUsersRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	messages, err := h.MessageRepository.GetMessagesBetweenUsers(req.User1ID, req.User2ID)
	if err != nil {
		http.Error(w, "Failed to retrieve messages", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(messages)
}

// UpdateMessage updates an existing message.
func (h *MessageHandler) UpdateMessage(w http.ResponseWriter, r *http.Request) {
	var req updateMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	message := &models.Message{
		ID:      req.ID,
		Content: req.Content,
		ReadAt:  req.ReadAt,
	}

	if err := h.MessageRepository.Update(message); err != nil {
		http.Error(w, "Failed to update message", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Message updated successfully",
	})
}

// DeleteMessage deletes a message by ID.
func (h *MessageHandler) DeleteMessage(w http.ResponseWriter, r *http.Request) {
	var req deleteMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := h.MessageRepository.Delete(req.ID); err != nil {
		http.Error(w, "Failed to delete message", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Message deleted successfully",
	})
}

func (h *MessageHandler) GetMessagesByConversationID(w http.ResponseWriter, r *http.Request) {
	conversationID := r.URL.Query().Get("conversation_id")
	if conversationID == "" {
		http.Error(w, "Missing conversation_id", http.StatusBadRequest)
		return
	}

	id, err := strconv.ParseInt(conversationID, 10, 64)
	if err != nil {
		http.Error(w, "Invalid conversation_id", http.StatusBadRequest)
		return
	}

	messages, err := h.MessageRepository.GetMessagesByConversationID(id)
	if err != nil {
		http.Error(w, "Error fetching messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func (h *MessageHandler) GetUserConversation(w http.ResponseWriter, r *http.Request) {
	userID, ok := middlewares.GetUserID(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	conversations, err := h.ConversationRepository.GetConversationByUserID(userID, h.MessageRepository)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversations)
}
