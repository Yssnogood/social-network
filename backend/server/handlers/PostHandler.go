package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"social-network/backend/app/services"
	"social-network/backend/database/models"
	repository "social-network/backend/database/repositories"
)

type PostHandler struct {
	PostService       *services.PostService
	PostRepository    *repository.PostRepository
	SessionRepository *repository.SessionRepository
}

func NewPostHandler(ps *services.PostService, pr *repository.PostRepository, sr *repository.SessionRepository) *PostHandler {
	return &PostHandler{
		PostService:       ps,
		PostRepository:    pr,
		SessionRepository: sr,
	}
}

type CreatePostRequest struct {
	JWT         string  `json:"jwt"`
	Content     string  `json:"content"`
	ImagePath   *string `json:"image_path,omitempty"`
	PrivacyType int64   `json:"privacy_type"`
}

type LikePostRequest struct {
	JWT     string `json:"jwt"`
	Post_ID int64  `json:"post_id"`
}

func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		fmt.Println(req, err)
		return
	}

	session, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	now := time.Now()
	post := &models.Post{
		UserID:      session.UserID,
		Content:     req.Content,
		ImagePath:   req.ImagePath,
		PrivacyType: req.PrivacyType,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	user, _ := h.PostService.GetPostAuthor(post)

	id, err := h.PostRepository.Create(post)
	if err != nil {
		http.Error(w, "Error creating post", http.StatusInternalServerError)
		return
	}

	post.ID = id
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"post":     post,
		"username": user.Username,
	})
}

// GetPostRequest is the request body for retrieving a post by ID.
type GetPostRequest struct {
	JWT string `json:"jwt"`
}

// GetPost retrieves a post by ID from JSON body.
func (h *PostHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req GetPostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Extract ID from URL path, assuming /post/{id}
	parts := strings.Split(r.URL.Path, "/")
	postID, err := strconv.Atoi(parts[3])
	if err != nil {
		fmt.Println("Post ID:", postID)
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}
	post, err := h.PostRepository.GetByID(int64(postID))
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(post)
}

func (h *PostHandler) LikePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req LikePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	session, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	h.PostRepository.Like(req.Post_ID, session.UserID)
}

// GetRecentsPosts retrieves recents posts.
func (h *PostHandler) GetRecentsPosts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req GetPostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	session, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user := h.SessionRepository.GetUserBySession(session)

	posts, err := h.PostRepository.GetPosts(h.PostService, user)
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(posts)
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
