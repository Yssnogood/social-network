package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
)

// GroupHandler handles HTTP requests for groups.
type GroupHandler struct {
	GroupRepository   *repository.GroupRepository
	SessionRepository *repository.SessionRepository
	UserRepository    *repository.UserRepository
}

// NewGroupHandler creates a new GroupHandler.
func NewGroupHandler(gr *repository.GroupRepository, sr *repository.SessionRepository, ur *repository.UserRepository) *GroupHandler {
	return &GroupHandler{
		GroupRepository:   gr,
		SessionRepository: sr,
		UserRepository:    ur,
	}
}

// Request DTOs
type CreateGroupRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

// Response DTOs
type GroupResponse struct {
	ID          int64  `json:"id"`
	CreatorID   int64  `json:"creator_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// CreateGroup handles the creation of a new group.
func (h *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	var req CreateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validation
	if req.Title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	// Create group
	group := &models.Group{
		CreatorID:   userID,
		Title:       req.Title,
		Description: &req.Description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	id, err := h.GroupRepository.Create(group)
	if err != nil {
		http.Error(w, "Failed to create group: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = h.GroupRepository.AddMember(group.ID, userID, true, time.Now())
	if err != nil {
		http.Error(w, "Failed to add group creator as member: "+err.Error(), http.StatusInternalServerError)
		return
	}

	group.ID = id

	// Return response
	response := GroupResponse{
		ID:        group.ID,
		CreatorID: group.CreatorID,
		Title:     group.Title,
		Description: func() string {
			if group.Description != nil {
				return *group.Description
			}
			return ""
		}(),
		CreatedAt: group.CreatedAt.Format(time.RFC3339),
		UpdatedAt: group.UpdatedAt.Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
