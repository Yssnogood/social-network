package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"

	repository "social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
)

// InvitationHandler handles HTTP requests for invitations.
type InvitationHandler struct {
	GroupRepository        *repository.GroupRepository
	SessionRepository      *repository.SessionRepository
	UserRepository         *repository.UserRepository
	NotificationRepository *repository.NotificationRepository
}

// NewInvitationHandler creates a new InvitationHandler.
func NewInvitationHandler(gr *repository.GroupRepository, sr *repository.SessionRepository, ur *repository.UserRepository, nr *repository.NotificationRepository) *InvitationHandler {
	return &InvitationHandler{
		GroupRepository:        gr,
		SessionRepository:      sr,
		UserRepository:         ur,
		NotificationRepository: nr,
	}
}

// Response DTOs
type InvitationResponse struct {
	ID        int64  `json:"id"`
	GroupID   int64  `json:"group_id"`
	GroupTitle string `json:"group_title"`
	InviterID int64  `json:"inviter_id"`
	InviterName string `json:"inviter_name"`
	InviteeID int64  `json:"invitee_id"`
	Pending   bool   `json:"pending"`
	CreatedAt string `json:"created_at"`
}

type RespondToInvitationRequest struct {
	Action string `json:"action"` // "accept" or "decline"
}

// Helper function to get username by userID
func (h *InvitationHandler) getUsernameByID(userID int64) (string, error) {
	user, err := h.UserRepository.GetByID(userID)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", fmt.Errorf("user not found")
	}
	return user.Username, nil
}

// GetUserReceivedInvitations returns all pending invitations received by a user
func (h *InvitationHandler) GetUserReceivedInvitations(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Missing user ID in path", http.StatusBadRequest)
		return
	}

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Only allow users to see their own invitations
	currentUserID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok || currentUserID != userID {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	invitations, err := h.GroupRepository.GetPendingInvitationsByUser(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve invitations: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var response []InvitationResponse
	for _, invitation := range invitations {
		// Get group details
		group, err := h.GroupRepository.GetGroupByID(invitation.GroupID)
		if err != nil {
			continue // Skip if group not found
		}

		// Get inviter details
		inviterName, err := h.getUsernameByID(invitation.InviterID)
		if err != nil {
			inviterName = "Unknown"
		}

		response = append(response, InvitationResponse{
			ID:          invitation.ID,
			GroupID:     invitation.GroupID,
			GroupTitle:  group.Title,
			InviterID:   invitation.InviterID,
			InviterName: inviterName,
			InviteeID:   invitation.InviteeID,
			Pending:     invitation.Pending,
			CreatedAt:   invitation.CreatedAt.Format(time.RFC3339),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetUserSentInvitations returns all invitations sent by a user
func (h *InvitationHandler) GetUserSentInvitations(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Missing user ID in path", http.StatusBadRequest)
		return
	}

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Only allow users to see their own invitations
	currentUserID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok || currentUserID != userID {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	invitations, err := h.GroupRepository.GetInvitationsByInviter(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve sent invitations: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var response []InvitationResponse
	for _, invitation := range invitations {
		// Get group details
		group, err := h.GroupRepository.GetGroupByID(invitation.GroupID)
		if err != nil {
			continue // Skip if group not found
		}

		// Get invitee details
		inviteeName, err := h.getUsernameByID(invitation.InviteeID)
		if err != nil {
			inviteeName = "Unknown"
		}

		response = append(response, InvitationResponse{
			ID:          invitation.ID,
			GroupID:     invitation.GroupID,
			GroupTitle:  group.Title,
			InviterID:   invitation.InviterID,
			InviterName: inviteeName, // For sent invitations, show invitee name
			InviteeID:   invitation.InviteeID,
			Pending:     invitation.Pending,
			CreatedAt:   invitation.CreatedAt.Format(time.RFC3339),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// RespondToInvitation handles acceptance or decline of an invitation
func (h *InvitationHandler) RespondToInvitation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	invitationIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Missing invitation ID in path", http.StatusBadRequest)
		return
	}

	invitationID, err := strconv.ParseInt(invitationIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid invitation ID", http.StatusBadRequest)
		return
	}

	currentUserID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	var req RespondToInvitationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Action != "accept" && req.Action != "decline" {
		http.Error(w, "Action must be 'accept' or 'decline'", http.StatusBadRequest)
		return
	}

	// Get the invitation to verify it belongs to the current user
	invitation, err := h.GroupRepository.GetInvitationByID(invitationID)
	if err != nil {
		http.Error(w, "Invitation not found: "+err.Error(), http.StatusNotFound)
		return
	}

	if invitation.InviteeID != currentUserID {
		http.Error(w, "You can only respond to your own invitations", http.StatusForbidden)
		return
	}

	if !invitation.Pending {
		http.Error(w, "This invitation has already been responded to", http.StatusBadRequest)
		return
	}

	if req.Action == "accept" {
		// Get user details for adding to group
		userName, err := h.getUsernameByID(currentUserID)
		if err != nil {
			http.Error(w, "Failed to get user information: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Add user to group
		err = h.GroupRepository.AddMember(invitation.GroupID, currentUserID, userName, true, time.Now())
		if err != nil {
			http.Error(w, "Failed to add user to group: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Delete the invitation (both accept and decline)
	err = h.GroupRepository.DeleteInvitation(currentUserID, invitation.GroupID)
	if err != nil {
		http.Error(w, "Failed to delete invitation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Delete related notifications
	err = h.NotificationRepository.DeleteGroupInvitationRequest(currentUserID, invitation.GroupID)
	if err != nil {
		http.Error(w, "Failed to clean up notifications: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// CancelInvitation allows the inviter to cancel a pending invitation
func (h *InvitationHandler) CancelInvitation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	invitationIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Missing invitation ID in path", http.StatusBadRequest)
		return
	}

	invitationID, err := strconv.ParseInt(invitationIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid invitation ID", http.StatusBadRequest)
		return
	}

	currentUserID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// Get the invitation to verify it belongs to the current user
	invitation, err := h.GroupRepository.GetInvitationByID(invitationID)
	if err != nil {
		http.Error(w, "Invitation not found: "+err.Error(), http.StatusNotFound)
		return
	}

	if invitation.InviterID != currentUserID {
		http.Error(w, "You can only cancel your own invitations", http.StatusForbidden)
		return
	}

	if !invitation.Pending {
		http.Error(w, "This invitation has already been responded to", http.StatusBadRequest)
		return
	}

	// Delete the invitation
	err = h.GroupRepository.DeleteInvitation(invitation.InviteeID, invitation.GroupID)
	if err != nil {
		http.Error(w, "Failed to cancel invitation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Delete related notifications
	err = h.NotificationRepository.DeleteGroupInvitationRequest(invitation.InviteeID, invitation.GroupID)
	if err != nil {
		http.Error(w, "Failed to clean up notifications: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}