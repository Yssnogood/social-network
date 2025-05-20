package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
)

type PostHandler struct {
	PostRepository *repository.PostRepository
}

func NewPostHandler(pr *repository.PostRepository) *PostHandler {
	return &PostHandler{
		PostRepository: pr,
	}
}

type CreatePostRequest struct {
	UserID      int64   `json:"user_id"`
	Content     string  `json:"content"`
	ImagePath   *string `json:"image_path,omitempty"`
	PrivacyType int64   `json:"privacy_type"`
}

func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	var req CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	now := time.Now()
	post := &models.Post{
		UserID:      req.UserID,
		Content:     req.Content,
		ImagePath:   req.ImagePath,
		PrivacyType: req.PrivacyType,
		CreatedAt:   now,
		UpdatedAt:   now,
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
// GetPostRequest is the request body for retrieving a post by ID.
type GetPostRequest struct {
	ID int64 `json:"id"`
}

// GetPost retrieves a post by ID from JSON body.
func (h *PostHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	var req GetPostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	post, err := h.PostRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(post)
}

// UpdatePostRequest is the request body for updating a post.
type UpdatePostRequest struct {
	ID          int64   `json:"id"`
	Content     string  `json:"content"`
	ImagePath   *string `json:"image_path,omitempty"`
	PrivacyType int64   `json:"privacy_type"`
}

// UpdatePost updates a post by ID from JSON body.
func (h *PostHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	var req UpdatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	post, err := h.PostRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	post.Content = req.Content
	post.ImagePath = req.ImagePath
	post.PrivacyType = req.PrivacyType
	post.UpdatedAt = time.Now()

	if err := h.PostRepository.Update(post); err != nil {
		http.Error(w, "Failed to update post", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Post updated successfully",
	})
}

// DeletePostRequest is the request body for deleting a post.
type DeletePostRequest struct {
	ID int64 `json:"id"`
}

// DeletePost deletes a post by ID from JSON body.
func (h *PostHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	var req DeletePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.PostRepository.Delete(req.ID); err != nil {
		http.Error(w, "Failed to delete post", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Post deleted successfully",
	})
}
