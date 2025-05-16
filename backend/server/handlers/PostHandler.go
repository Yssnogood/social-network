package handlers

import (
	"net/http"
	"encoding/json"

	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
)

// PostHandler is a handler for managing posts.
type PostHandler struct {
	PostRepository *repository.PostRepository
}

// NewPostHandler creates a new PostHandler.
func NewPostHandler(pr *repository.PostRepository) *PostHandler {
	return &PostHandler{
		PostRepository: pr,
	}
}

// CreatePostRequest is the request body for creating a post.
type CreatePostRequest struct {
	UserID      int64     `json:"user_id"`
	Content     string    `json:"content"`
	ImagePath   *string   `json:"image_path,omitempty"`
	PrivacyType int64     `json:"privacy_type"`
}

// CreatePost creates a new post.
func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	var req CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	post := &models.Post{
		UserID:      req.UserID,
		Content:     req.Content,
		ImagePath:   req.ImagePath,
		PrivacyType: req.PrivacyType,
	}

	id, err := h.PostRepository.Create(post)
	if err != nil {
		http.Error(w, "Error creating post", http.StatusInternalServerError)
		return
	}

	post.ID = id
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post)
}