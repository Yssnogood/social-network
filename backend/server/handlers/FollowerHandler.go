package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
)

// FollowerHandler handles HTTP requests related to followers.
type FollowerHandler struct {
	FollowerRepository *repository.FollowerRepository
}

// NewFollowerHandler creates a new instance of FollowerHandler.
func NewFollowerHandler(fr *repository.FollowerRepository) *FollowerHandler {
	return &FollowerHandler{
		FollowerRepository: fr,
	}
}

// Request DTOs

type followRequest struct {
	FollowerID int64 `json:"follower_id"`
	FollowedID int64 `json:"followed_id"`
}

type acceptFollowerRequest struct {
	FollowerID int64 `json:"follower_id"`
	FollowedID int64 `json:"followed_id"`
}

type getFollowersRequest struct {
	UserID int64 `json:"user_id"`
}

// Handlers

// CreateFollower creates a new follow request (or direct follow if accepted by default).
func (h *FollowerHandler) CreateFollower(w http.ResponseWriter, r *http.Request) {
	var req followRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	follower := &models.Follower{
		FollowerID: req.FollowerID,
		FollowedID: req.FollowedID,
		Accepted:   false, // pending by default
		FollowedAt: time.Now(),
	}

	if err := h.FollowerRepository.Create(follower); err != nil {
		http.Error(w, "Failed to follow user", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Follow request sent",
	})
}

// AcceptFollowRequest accepts a follow request.
func (h *FollowerHandler) AcceptFollowRequest(w http.ResponseWriter, r *http.Request) {
	var req acceptFollowerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.FollowerRepository.Accept(req.FollowerID, req.FollowedID); err != nil {
		http.Error(w, "Failed to accept follow request", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Follow request accepted",
	})
}

// GetFollowers retrieves all followers for a user.
func (h *FollowerHandler) GetFollowers(w http.ResponseWriter, r *http.Request) {
	var req getFollowersRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	followers, err := h.FollowerRepository.GetFollowers(req.UserID)
	if err != nil {
		http.Error(w, "Failed to retrieve followers", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(followers)
}

// UnCreateFollower removes a follower relationship.
func (h *FollowerHandler) DeleteFollower(w http.ResponseWriter, r *http.Request) {
	var req followRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.FollowerRepository.Delete(req.FollowerID, req.FollowedID); err != nil {
		http.Error(w, "Failed to unfollow user", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Unfollowed successfully",
	})
}
