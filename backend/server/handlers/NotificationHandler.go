package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
)

// NotificationHandler handles HTTP requests related to notifications.
type NotificationHandler struct {
	NotificationRepository *repository.NotificationRepository
}

// NewNotificationHandler creates a new instance of NotificationHandler.
func NewNotificationHandler(nr *repository.NotificationRepository) *NotificationHandler {
	return &NotificationHandler{
		NotificationRepository: nr,
	}
}

// Request DTOs

type createNotificationRequest struct {
	UserID        int64  `json:"user_id"`
	Type          string `json:"type"`
	Content       string `json:"content"`
	Read          bool   `json:"read"`
	ReferenceID   int64  `json:"reference_id"`
	ReferenceType string `json:"reference_type"`
}

type getNotificationRequest struct {
	ID int64 `json:"id"`
}

type getUserNotificationsRequest struct {
	UserID int64 `json:"user_id"`
}

type updateNotificationRequest struct {
	ID            int64  `json:"id"`
	UserID        int64  `json:"user_id"`
	Type          string `json:"type"`
	Content       string `json:"content"`
	Read          bool   `json:"read"`
	ReferenceID   int64  `json:"reference_id"`
	ReferenceType string `json:"reference_type"`
}

type deleteNotificationRequest struct {
	ID int64 `json:"id"`
}

type deleteAllNotificationsRequest struct {
	UserID int64 `json:"user_id"`
}

// Handlers

// CreateNotification handles the creation of a new notification.
func (h *NotificationHandler) CreateNotification(w http.ResponseWriter, r *http.Request) {
	var req createNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	notification := &models.Notification{
		UserID:        req.UserID,
		Type:          req.Type,
		Content:       req.Content,
		Read:          req.Read,
		ReferenceID:   &req.ReferenceID,
		ReferenceType: &req.ReferenceType,
		CreatedAt:     time.Now(),
	}

	id, err := h.NotificationRepository.Create(notification)
	if err != nil {
		http.Error(w, "Failed to create notification", http.StatusInternalServerError)
		return
	}

	notification.ID = id
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(notification)
}

// GetNotification retrieves a single notification by ID.
func (h *NotificationHandler) GetNotification(w http.ResponseWriter, r *http.Request) {
	var req getNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	notification, err := h.NotificationRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "Notification not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(notification)
}

// GetAllNotificationsForUser retrieves all notifications for a user.
func (h *NotificationHandler) GetAllNotificationsForUser(w http.ResponseWriter, r *http.Request) {
	var req getUserNotificationsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	notifications, err := h.NotificationRepository.GetAllByUserID(req.UserID)
	if err != nil {
		http.Error(w, "Failed to get notifications", http.StatusInternalServerError)
		return
	}
	fmt.Println("Notifications retrieved for user ID:", req.UserID, notifications)

	json.NewEncoder(w).Encode(notifications)
}

// UpdateNotification updates an existing notification.
func (h *NotificationHandler) UpdateNotification(w http.ResponseWriter, r *http.Request) {
	var req updateNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	notification := &models.Notification{
		ID:            req.ID,
		UserID:        req.UserID,
		Type:          req.Type,
		Content:       req.Content,
		Read:          req.Read,
		ReferenceID:   &req.ReferenceID,
		ReferenceType: &req.ReferenceType,
	}

	if err := h.NotificationRepository.Update(notification); err != nil {
		http.Error(w, "Failed to update notification", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Notification updated successfully",
	})
}

// DeleteNotification deletes a single notification by ID.
func (h *NotificationHandler) DeleteNotification(w http.ResponseWriter, r *http.Request) {
	var req deleteNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.NotificationRepository.Delete(req.ID); err != nil {
		http.Error(w, "Failed to delete notification", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Notification deleted successfully",
	})
}

// DeleteAllNotificationsByUser deletes all notifications for a specific user.
func (h *NotificationHandler) DeleteAllNotificationsByUser(w http.ResponseWriter, r *http.Request) {
	var req deleteAllNotificationsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.NotificationRepository.DeleteAllByUserID(req.UserID); err != nil {
		http.Error(w, "Failed to delete notifications", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "All notifications deleted successfully",
	})
}
