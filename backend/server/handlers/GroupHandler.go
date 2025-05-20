package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
)

// GroupHandler handles HTTP requests for groups.
type GroupHandler struct {
	GroupRepository *repository.GroupRepository
}

// NewGroupHandler creates a new GroupHandler.
func NewGroupHandler(gr *repository.GroupRepository) *GroupHandler {
	return &GroupHandler{
		GroupRepository: gr,
	}
}

// Request DTOs

type createGroupRequest struct {
	CreatorID   int64  `json:"creator_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type updateGroupRequest struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type getGroupByIDRequest struct {
	ID int64 `json:"id"`
}

type getGroupsByCreatorRequest struct {
	CreatorID int64 `json:"creator_id"`
}

type deleteGroupRequest struct {
	ID int64 `json:"id"`
}

// Handlers

// CreateGroup handles the creation of a new group.
func (h *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	var req createGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	group := &models.Group{
		CreatorID:   req.CreatorID,
		Title:       req.Title,
		Description: req.Description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	id, err := h.GroupRepository.Create(group)
	if err != nil {
		http.Error(w, "Failed to create group", http.StatusInternalServerError)
		return
	}

	group.ID = id
	json.NewEncoder(w).Encode(group)
}

// GetGroupByID retrieves a group by its ID.
func (h *GroupHandler) GetGroupByID(w http.ResponseWriter, r *http.Request) {
	var req getGroupByIDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	group, err := h.GroupRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(group)
}

// GetGroupsByCreator retrieves all groups created by a user.
func (h *GroupHandler) GetGroupsByCreator(w http.ResponseWriter, r *http.Request) {
	var req getGroupsByCreatorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	groups, err := h.GroupRepository.GetByCreatorID(req.CreatorID)
	if err != nil {
		http.Error(w, "Failed to retrieve groups", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(groups)
}

// UpdateGroup updates a group's title and description.
func (h *GroupHandler) UpdateGroup(w http.ResponseWriter, r *http.Request) {
	var req updateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	group := &models.Group{
		ID:          req.ID,
		Title:       req.Title,
		Description: req.Description,
		UpdatedAt:   time.Now(),
	}

	if err := h.GroupRepository.Update(group); err != nil {
		http.Error(w, "Failed to update group", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Group updated successfully",
	})
}

// DeleteGroup deletes a group by its ID.
func (h *GroupHandler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	var req deleteGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := h.GroupRepository.Delete(req.ID); err != nil {
		http.Error(w, "Failed to delete group", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Group deleted successfully",
	})
}
