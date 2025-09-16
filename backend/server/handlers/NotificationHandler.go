package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"social-network/backend/database/models"
	repository "social-network/backend/database/repositories"
	"social-network/backend/websocket"
)

// NotificationHandler handles HTTP requests related to notifications.
type NotificationHandler struct {
	NotificationRepository *repository.NotificationRepository
	FollowerRepository     *repository.FollowerRepository
	GroupRepository        *repository.GroupRepository
}

// NewNotificationHandler creates a new instance of NotificationHandler.
func NewNotificationHandler(nr *repository.NotificationRepository, fr *repository.FollowerRepository, gr *repository.GroupRepository) *NotificationHandler {
	return &NotificationHandler{
		NotificationRepository: nr,
		FollowerRepository:     fr,
		GroupRepository:        gr,
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

type deleteNotificationByRefRequest struct {
	ReferenceID int64  `json:"reference_id"`
	Type        string `json:"type"`
}

// Handlers

// CreateNotification handles the creation of a new notification.
func (h *NotificationHandler) CreateNotification(w http.ResponseWriter, r *http.Request) {
	var req createNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	if req.Type == "post_created" || (strings.Contains(req.Type, "group") && !strings.Contains(req.Type, "comment") && !strings.Contains(req.Type, "invitation")) {
		fmt.Println("Creating notification to broadcast...")
		h.BroadcastNotifToUsers(w, r, req)
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

	// Envoyer la notification en temps réel via WebSocket
	if websocket.GlobalHub != nil {
		websocket.GlobalHub.SendNotificationToUser(int64(req.UserID), notification)
	}

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

// Notificate all users that follows the post owner for a specific post (new post from the owner).
func (h *NotificationHandler) BroadcastNotifToUsers(w http.ResponseWriter, r *http.Request, req createNotificationRequest) {
	notification := &models.Notification{
		UserID:        0, // This will be set for each follower
		Type:          req.Type,
		Content:       req.Content,
		Read:          req.Read,
		ReferenceID:   &req.ReferenceID,
		ReferenceType: &req.ReferenceType,
		CreatedAt:     time.Now(),
	}

	if req.Type == "post_created" {
		// req.UserID is the ID of the post owner
		followers, err := h.FollowerRepository.GetFollowers(req.UserID)
		if err != nil {
			http.Error(w, "Failed to get followers", http.StatusInternalServerError)
			return
		}

		// Send the notification to each follower
		for _, f := range followers {
			notification.UserID = f.FollowerID
			id, err := h.NotificationRepository.Create(notification)
			if err != nil {
				continue
			}

			// Envoyer la notification en temps réel via WebSocket
			notification.ID = id
			if websocket.GlobalHub != nil {
				websocket.GlobalHub.SendNotificationToUser(int64(f.FollowerID), notification)
			}
		}
	}

	if strings.Contains(req.Type, "group") {
		// req.ReferenceID is the ID of the group
		groupMembers, err := h.GroupRepository.GetMembersByGroupID(req.ReferenceID)
		if err != nil {
			http.Error(w, "Failed to get group members", http.StatusInternalServerError)
			return
		}

		// Send the notification to each group member
		for _, member := range groupMembers {
			if member.UserID == req.UserID {
				continue // Skip the sender
			}
			notification.UserID = member.UserID
			id, err := h.NotificationRepository.Create(notification)
			if err != nil {
				continue
			}

			// Envoyer la notification en temps réel via WebSocket
			notification.ID = id
			if websocket.GlobalHub != nil {
				websocket.GlobalHub.SendNotificationToUser(int64(member.UserID), notification)
			}
		}
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Notifications sent to followers",
	})
}
