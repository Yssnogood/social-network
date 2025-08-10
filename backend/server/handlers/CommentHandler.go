package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"social-network/backend/database/models"
	repository "social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
)

// CommentHandler handles comment-related HTTP requests.
type CommentHandler struct {
	CommentRepository *repository.CommentRepository
	SessionRepository *repository.SessionRepository
	UserRepository    *repository.UserRepository
}

// NewCommentHandler creates a new CommentHandler.
func NewCommentHandler(cr *repository.CommentRepository, sr *repository.SessionRepository, ur *repository.UserRepository) *CommentHandler {
	return &CommentHandler{
		CommentRepository: cr,
		SessionRepository: sr,
		UserRepository:    ur,
	}
}

// Request structs
type createCommentRequest struct {
	PostID    int64   `json:"post_id"`
	Content   string  `json:"content"`
	ImagePath *string `json:"image_path,omitempty"`
}

type getCommentRequest struct {
	ID int64 `json:"id"`
}

type getCommentsRequestByUserId struct{
	ID int64 `json:"user_id"`
}

type updateCommentRequest struct {
	ID        int64   `json:"id"`
	Content   string  `json:"content"`
	ImagePath *string `json:"image_path,omitempty"`
}

type deleteCommentRequest struct {
	ID int64 `json:"id"`
}

type getPostCommentsRequest struct {
	PostID int64 `json:"post_id"`
}

// Handlers

// CreateComment handles creating a new comment.
func (h *CommentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	var req createCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get userID from context (set by JWTMiddleware)
	userID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	comment := &models.Comment{
		PostID:    req.PostID,
		UserID:    userID,
		Content:   req.Content,
		ImagePath: req.ImagePath,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	id, err := h.CommentRepository.Create(comment)
	if err != nil {
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	comment.ID = id
	
	// Get username for frontend
	userName, err := h.getUsernameByID(userID)
	if err != nil {
		http.Error(w, "Failed to get user information: "+err.Error(), http.StatusInternalServerError)
		return
	}
	comment.Username = userName
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(comment)
}

// GetComment returns a single comment by ID.
func (h *CommentHandler) GetComment(w http.ResponseWriter, r *http.Request) {
	var req getCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	comment, err := h.CommentRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "Comment not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(comment)
}

func (h *CommentHandler) GetCommentsFromUserByID(w http.ResponseWriter, r *http.Request){
	var req getCommentsRequestByUserId
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	comment, err := h.CommentRepository.GetCommentsFromUserByID(req.ID)
	if err != nil {
		http.Error(w, "Comment not found", http.StatusNotFound)
		return
	}


	json.NewEncoder(w).Encode(comment)
}

// GetCommentsByPost returns all comments for a specific post.
func (h *CommentHandler) GetCommentsByPost(w http.ResponseWriter, r *http.Request) {
	var req getPostCommentsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	comments, err := h.CommentRepository.GetComments(req.PostID)
	if err != nil {
		http.Error(w, "Failed to retrieve comments", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(comments)
}

// UpdateComment modifies an existing comment.
func (h *CommentHandler) UpdateComment(w http.ResponseWriter, r *http.Request) {
	var req updateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	comment, err := h.CommentRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "Comment not found", http.StatusNotFound)
		return
	}

	comment.Content = req.Content
	comment.ImagePath = req.ImagePath
	comment.UpdatedAt = time.Now()

	if err := h.CommentRepository.Update(comment); err != nil {
		http.Error(w, "Failed to update comment", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Comment updated successfully",
	})
}

// DeleteComment removes a comment by ID.
func (h *CommentHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	var req deleteCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.CommentRepository.Delete(req.ID); err != nil {
		http.Error(w, "Failed to delete comment", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Comment deleted successfully",
	})
}

// getUsernameByID gets the username for a user ID
func (h *CommentHandler) getUsernameByID(userID int64) (string, error) {
	user, err := h.UserRepository.GetByID(userID)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", fmt.Errorf("user not found")
	}
	return user.Username, nil
}
