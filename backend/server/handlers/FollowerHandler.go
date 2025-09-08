package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"social-network/backend/database/models"
	repository "social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
	"social-network/backend/websocket"
)

// FollowerHandler handles HTTP requests related to followers.
type FollowerHandler struct {
	FollowerRepository     *repository.FollowerRepository
	NotificationRepository *repository.NotificationRepository
	UserRepository         *repository.UserRepository
	WebSocketHub           WebSocketHubInterface
}

// WebSocketHubInterface définit les méthodes nécessaires pour les notifications temps réel
type WebSocketHubInterface interface {
	SendToUser(userID int64, message websocket.WSMessage)
}

// NewFollowerHandler creates a new instance of FollowerHandler.
func NewFollowerHandler(fr *repository.FollowerRepository, nr *repository.NotificationRepository, ur *repository.UserRepository, hub WebSocketHubInterface) *FollowerHandler {
	return &FollowerHandler{
		FollowerRepository:     fr,
		NotificationRepository: nr,
		UserRepository:         ur,
		WebSocketHub:           hub,
	}
}

// Request DTOs

type followRequest struct {
	FollowerID int64 `json:"follower_id"`
	FollowedID int64 `json:"followed_id"`
	Private    bool  `json:"is_public"`
}

type acceptFollowerRequest struct {
	FollowerID int64 `json:"follower_id"`
	FollowedID int64 `json:"followed_id"`
}

// Handlers

// CreateFollower creates a new follow request (or direct follow if accepted by default).
func (h *FollowerHandler) CreateFollower(w http.ResponseWriter, r *http.Request) {
	// Récupérer l'utilisateur connecté depuis le middleware JWT
	followerUserID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	var req followRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Vérifier que l'utilisateur ne tente pas de se suivre lui-même
	if followerUserID == req.FollowedID {
		http.Error(w, "Cannot follow yourself", http.StatusBadRequest)
		return
	}

	// Vérifier si l'utilisateur suit déjà cette personne
	isAlreadyFollowing, err := h.FollowerRepository.IsFollowing(followerUserID, req.FollowedID)
	if err != nil {
		http.Error(w, "Failed to check following status", http.StatusInternalServerError)
		return
	}
	if isAlreadyFollowing {
		http.Error(w, "Already following this user", http.StatusConflict)
		return
	}

	// Récupérer l'utilisateur à suivre pour connaître son statut public/privé
	followedUser, err := h.UserRepository.GetByID(req.FollowedID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Déterminer si le follow doit être automatiquement accepté
	// Si l'utilisateur est public, accepter automatiquement
	// Si l'utilisateur est privé, créer une demande en attente
	accepted := followedUser.IsPublic

	follower := &models.Follower{
		FollowerID: followerUserID, // Utiliser l'ID du JWT, plus sécurisé
		FollowedID: req.FollowedID,
		Accepted:   accepted,
		FollowedAt: time.Now(),
	}

	if err := h.FollowerRepository.Create(follower); err != nil {
		http.Error(w, "Failed to follow user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Créer une notification pour la demande de follow (seulement si non acceptée automatiquement)
	if !accepted {
		followerUser, err := h.UserRepository.GetByID(followerUserID)
		if err == nil && followerUser != nil {
			// Supprimer d'abord toute notification existante pour éviter les doublons
			_ = h.NotificationRepository.DeleteFollowRequestFromUser(req.FollowedID, followerUserID)

			referenceType := "follow_request"
			notification := &models.Notification{
				UserID:        req.FollowedID,
				Type:          "follow_request",
				Content:       followerUser.Username + " vous a envoyé une demande de suivi.",
				Read:          false,
				ReferenceID:   &followerUserID,
				ReferenceType: &referenceType,
				CreatedAt:     time.Now(),
			}
			// Ne pas faire échouer si la notification échoue
			notificationID, err := h.NotificationRepository.Create(notification)
			if err == nil {
				// Mettre à jour l'ID de la notification avec celui retourné par la DB
				notification.ID = notificationID
				// Envoyer la notification en temps réel via WebSocket
				h.sendNotificationWebSocket(req.FollowedID, notification)
			}
			_ = notificationID
		}
	}

	message := "Follow request sent"
	if accepted {
		message = "User followed successfully"
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": message,
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

// DeleteFollower removes a follower relationship.
func (h *FollowerHandler) DeleteFollower(w http.ResponseWriter, r *http.Request) {
	// Récupérer l'utilisateur connecté depuis le middleware JWT
	followerUserID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	var req followRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Utiliser l'ID du JWT pour plus de sécurité
	if err := h.FollowerRepository.Delete(followerUserID, req.FollowedID); err != nil {
		http.Error(w, "Failed to unfollow user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Supprimer aussi la notification de demande de follow si elle existe
	if err := h.NotificationRepository.DeleteFollowRequestFromUser(req.FollowedID, followerUserID); err != nil {
		// Ne pas échouer si la notification n'existe pas
		// http.Error(w, "Failed to delete friend request", http.StatusInternalServerError)
		// return
	}

	// Envoyer une notification WebSocket pour informer que la demande a été retirée
	followerUser, err := h.UserRepository.GetByID(followerUserID)
	if err == nil && followerUser != nil {
		wsMessage := websocket.WSMessage{
			Type:             "notification_removed",
			Content:          followerUser.Username + " a retiré sa demande de suivi.",
			NotificationType: func() *string { s := "follow_request"; return &s }(),
			ReferenceID:      &followerUserID,
			ReferenceType:    func() *string { s := "follow_request"; return &s }(),
			Timestamp:        time.Now(),
		}

		// Envoyer via WebSocket à l'utilisateur qui était suivi
		h.WebSocketHub.SendToUser(req.FollowedID, wsMessage)
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

	// Envoyer un message WebSocket pour supprimer la notification côté client
	followerUser, err := h.UserRepository.GetByID(req.FollowerID)
	if err == nil && followerUser != nil {
		wsMessage := websocket.WSMessage{
			Type:             "notification_removed",
			Content:          "Demande de suivi acceptée.",
			NotificationType: func() *string { s := "follow_request"; return &s }(),
			ReferenceID:      &req.FollowerID,
			ReferenceType:    func() *string { s := "user"; return &s }(),
		}
		h.WebSocketHub.SendToUser(req.FollowedID, wsMessage)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Follow request accepted",
	})
}

func (h *FollowerHandler) DeclineFollower(w http.ResponseWriter, r *http.Request) {
	var req acceptFollowerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.FollowerRepository.Delete(req.FollowerID, req.FollowedID); err != nil {
		http.Error(w, "Failed to decline follower: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := h.NotificationRepository.DeleteFollowRequestFromUser(req.FollowedID, req.FollowerID); err != nil {
		// Ne pas échouer si la notification n'existe pas
		// http.Error(w, "Failed to delete friend request", http.StatusInternalServerError)
		// return
	}

	// Envoyer un message WebSocket pour supprimer la notification côté client
	followerUser, err := h.UserRepository.GetByID(req.FollowerID)
	if err == nil && followerUser != nil {
		wsMessage := websocket.WSMessage{
			Type:             "notification_removed",
			Content:          "Demande de suivi refusée.",
			NotificationType: func() *string { s := "follow_request"; return &s }(),
			ReferenceID:      &req.FollowerID,
			ReferenceType:    func() *string { s := "user"; return &s }(),
		}
		h.WebSocketHub.SendToUser(req.FollowedID, wsMessage)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Follow request declined",
	})
}

// sendNotificationWebSocket envoie une notification en temps réel via WebSocket
func (h *FollowerHandler) sendNotificationWebSocket(userID int64, notification *models.Notification) {
	if h.WebSocketHub == nil {
		return
	}

	// Créer le message WebSocket pour la notification
	wsMessage := websocket.WSMessage{
		Type:             "notification",
		Content:          notification.Content,
		NotificationID:   &notification.ID,
		NotificationType: &notification.Type,
		Read:             &notification.Read,
		ReferenceID:      notification.ReferenceID,
		ReferenceType:    notification.ReferenceType,
		Timestamp:        notification.CreatedAt,
	}

	// Envoyer via WebSocket à l'utilisateur spécifique
	h.WebSocketHub.SendToUser(userID, wsMessage)
}
