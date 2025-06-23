package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"social-network/backend/database/models"
	repository "social-network/backend/database/repositories"
)

// ConversationHandler handles conversations-related HTTP requests.
type ConversationHandler struct {
	ConversationRepository *repository.ConversationRepository
	SessionRepository      *repository.SessionRepository
}

type createConversationRequest struct {
	JWT     string `json:"jwt"`
	Name    string `json:"name"`
	IsGroup bool   `json:"is_group"`
}

// NewCommentHandler creates a new ConversationHandler.
func NewConversationHandler(cr *repository.ConversationRepository, sr *repository.SessionRepository) *ConversationHandler {
	return &ConversationHandler{
		ConversationRepository: cr,
		SessionRepository:      sr,
	}
}

// CreateComment handles creating a new conversation.
func (h *ConversationHandler) CreateConversation(w http.ResponseWriter, r *http.Request) {
	var req createConversationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	_, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	conversation := &models.Conversation{
		Name:      req.Name,
		IsGroup:   req.IsGroup,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	id, err := h.ConversationRepository.Create(conversation)
	if err != nil {
		http.Error(w, "Failed to create conversation", http.StatusInternalServerError)
		return
	}

	conversation.ID = id
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(conversation)
}
