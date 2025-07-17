package handlers

import (
	"encoding/json"
	"net/http"
	"time"
	"fmt"
	"strconv"

	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
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
		Accepted:   true, // pending by default
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
	// Récupération du user ID depuis le contexte (middleware JWT)
	userID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	followers, err := h.FollowerRepository.GetFollowers(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve followers", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
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


func (h *FollowerHandler) CheckIfFollowing(w http.ResponseWriter, r *http.Request) {
	var req followRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}


	isFollowing, err := h.FollowerRepository.IsFollowing(req.FollowerID, req.FollowedID)
	if err != nil {
		http.Error(w, "Failed to check following status", http.StatusInternalServerError)
		return
	}

	fmt.Println(isFollowing, req.FollowerID, req.FollowedID)

	json.NewEncoder(w).Encode(map[string]bool{
		"isFollowing": isFollowing,
	})
}

type FollowerUserResponse struct {
	ID        int64  `json:"id"`
	Username string `json:"username"`
	Avatar_path string `json:"avatar_path"`
}


func (h *FollowerHandler) GetFollowersHandler(w http.ResponseWriter, r *http.Request) {
	// Lire userID depuis la query string : ?userID=123
	userIDStr := r.URL.Query().Get("userID")
	if userIDStr == "" {
		http.Error(w, "Missing userID", http.StatusBadRequest)
		return
	}

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid userID", http.StatusBadRequest)
		return
	}

	fmt.Println("Ici")

	followers, err := h.FollowerRepository.GetFollowerUsers(userID)
fmt.Println("Pourquoi pas là")
fmt.Println(followers)
	if err != nil {
		http.Error(w, "Failed to fetch followers", http.StatusInternalServerError)
		return
	}

	response := make([]*FollowerUserResponse, 0, len(followers))
	for _, f := range followers {
		response = append(response, &FollowerUserResponse{
			ID:        f.ID,
			Username: f.Username,
			Avatar_path: f.Avatar_path,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
