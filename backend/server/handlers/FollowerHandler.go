package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"social-network/backend/database/models"
	repository "social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
)

// FollowerHandler handles HTTP requests related to followers.
type FollowerHandler struct {
	FollowerRepository     *repository.FollowerRepository
	NotificationRepository *repository.NotificationRepository
	UserRepository         *repository.UserRepository
}

// NewFollowerHandler creates a new instance of FollowerHandler.
func NewFollowerHandler(
	fr *repository.FollowerRepository, 
	nr *repository.NotificationRepository, 
	ur *repository.UserRepository,  // Add this
) *FollowerHandler {
	return &FollowerHandler{
		FollowerRepository:     fr,
		NotificationRepository: nr,
		UserRepository:         ur,  // Initialize it
	}
}
// Request DTOs

type followRequest struct {
	FollowerID int64 `json:"follower_id"`
	FollowedID int64 `json:"followed_id"`
	IsPublic    bool  `json:"is_public"`
}

type acceptFollowerRequest struct {
	FollowerID int64 `json:"follower_id"`
	FollowedID int64 `json:"followed_id"`
}

// Handlers

func (h *FollowerHandler) CreateFollower(w http.ResponseWriter, r *http.Request) {
    var req followRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Determine if the follow is automatic or a request
    accepted := req.IsPublic

    follower := &models.Follower{
        FollowerID: req.FollowerID,
        FollowedID: req.FollowedID,
        Accepted:   accepted,
        FollowedAt: time.Now(),
    }

    if err := h.FollowerRepository.Create(follower); err != nil {
        http.Error(w, "Failed to follow user", http.StatusInternalServerError)
        return
    }

    // 🔑 Get follower username for notification message
    followerUser, err := h.UserRepository.GetByID(req.FollowerID)
    if err != nil {
        http.Error(w, "Failed to get follower user", http.StatusInternalServerError)
        return
    }

    var notifType, notifContent string
    if accepted {
        notifType = "follow"
        notifContent = followerUser.Username + " started following you"
    } else {
        notifType = "follow_request"
        notifContent = followerUser.Username + " sent you a follow request"
    }

    // Set reference ID and type
    refID := req.FollowerID
    refType := "user"

    _, err = h.NotificationRepository.CreateNotification(
        req.FollowedID,
        notifType,
        notifContent,
        &refID,
        &refType,
    )
    if err != nil {
        http.Error(w, "Failed to create notification", http.StatusInternalServerError)
        return
    }

    resp := map[string]bool{
        "followed":    accepted,
        "requestSent": !accepted,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
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

	if err := h.NotificationRepository.DeleteFollowRequestFromUser(req.FollowedID, req.FollowerID); err != nil {
		http.Error(w, "Failed to delete friend request", http.StatusInternalServerError)
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
	isPending, err := h.FollowerRepository.IsPending(req.FollowerID, req.FollowedID)
	if err != nil {
		http.Error(w, "Failed to check following status", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]bool{
		"isFollowing": isFollowing,
		"isPending":   isPending,
	})
}

type FollowerUserResponse struct {
	ID          int64  `json:"id"`
	Username    string `json:"username"`
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

	followers, err := h.FollowerRepository.GetFollowerUsers(userID)
	if err != nil {
		http.Error(w, "Failed to fetch followers", http.StatusInternalServerError)
		return
	}

	response := make([]*FollowerUserResponse, 0, len(followers))
	for _, f := range followers {
		response = append(response, &FollowerUserResponse{
			ID:          f.ID,
			Username:    f.Username,
			Avatar_path: f.Avatar_path,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *FollowerHandler) AcceptFollower(w http.ResponseWriter, r *http.Request) {
	var req acceptFollowerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.FollowerRepository.Accept(req.FollowerID, req.FollowedID); err != nil {
		http.Error(w, "Failed to accept follower", http.StatusInternalServerError)
		return
	}

	if err := h.NotificationRepository.DeleteFollowRequestFromUser(req.FollowedID, req.FollowerID); err != nil {
		http.Error(w, "Failed to delete friend request", http.StatusInternalServerError)
		return
	}

}

func (h *FollowerHandler) DeclineFollower(w http.ResponseWriter, r *http.Request) {
	var req acceptFollowerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.FollowerRepository.Delete(req.FollowerID, req.FollowedID); err != nil {
		http.Error(w, "Failed to decline follower", http.StatusInternalServerError)
		return
	}

	if err := h.NotificationRepository.DeleteFollowRequestFromUser(req.FollowedID, req.FollowerID); err != nil {
		http.Error(w, "Failed to delete friend request", http.StatusInternalServerError)
		return
	}

}

func (h *FollowerHandler) GetFollowingHandler(w http.ResponseWriter, r *http.Request) {
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

    following, err := h.FollowerRepository.GetFollowingUsers(userID)
    if err != nil {
        http.Error(w, "Failed to fetch following", http.StatusInternalServerError)
        return
    }

    response := make([]*FollowerUserResponse, 0, len(following))
    for _, f := range following {
        response = append(response, &FollowerUserResponse{
            ID:          f.ID,
            Username:    f.Username,
            Avatar_path: f.Avatar_path,
        })
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
