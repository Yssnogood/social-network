package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
)

// SessionHandler handles HTTP requests related to sessions.
type SessionHandler struct {
	SessionRepository *repository.SessionRepository
}

// NewSessionHandler creates a new SessionHandler.
func NewSessionHandler(sr *repository.SessionRepository) *SessionHandler {
	return &SessionHandler{
		SessionRepository: sr,
	}
}

// Request DTOs

type createSessionRequest struct {
	UserID       int64     `json:"user_id"`
	SessionToken string    `json:"session_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

type getSessionByIDRequest struct {
	ID int64 `json:"id"`
}

type updateSessionRequest struct {
	ID           int64     `json:"id"`
	UserID       int64     `json:"user_id"`
	SessionToken string    `json:"session_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

type deleteSessionRequest struct {
	ID int64 `json:"id"`
}

// Handlers

// CreateSession creates a new session in the database.
func (h *SessionHandler) CreateSession(w http.ResponseWriter, r *http.Request) {
	var req createSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	session := &models.Session{
		UserID:       req.UserID,
		SessionToken: req.SessionToken,
		CreatedAt:    time.Now(),
		ExpiresAt:    req.ExpiresAt,
	}

	id, err := h.SessionRepository.Create(session)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	session.ID = id
	json.NewEncoder(w).Encode(session)
}

// GetSessionByID retrieves a session by its ID.
func (h *SessionHandler) GetSessionByID(w http.ResponseWriter, r *http.Request) {
	var req getSessionByIDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	session, err := h.SessionRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(session)
}

// UpdateSession updates an existing session.
func (h *SessionHandler) UpdateSession(w http.ResponseWriter, r *http.Request) {
	var req updateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	session := &models.Session{
		ID:           req.ID,
		UserID:       req.UserID,
		SessionToken: req.SessionToken,
		ExpiresAt:    req.ExpiresAt,
	}

	if err := h.SessionRepository.Update(session); err != nil {
		http.Error(w, "Failed to update session", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Session updated successfully",
	})
}

// DeleteSession deletes a session from the database.
func (h *SessionHandler) DeleteSession(w http.ResponseWriter, r *http.Request) {
	var req deleteSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := h.SessionRepository.Delete(req.ID); err != nil {
		http.Error(w, "Failed to delete session", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Session deleted successfully",
	})
}
