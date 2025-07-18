package handlers

import (
	"encoding/json"
	"net/http"
	"time"
	"strconv"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"fmt"

	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
)

// GroupHandler handles HTTP requests for groups.
type GroupHandler struct {
	GroupRepository   *repository.GroupRepository
	SessionRepository *repository.SessionRepository
	UserRepository    *repository.UserRepository
}

// NewGroupHandler creates a new GroupHandler.
func NewGroupHandler(gr *repository.GroupRepository, sr *repository.SessionRepository, ur *repository.UserRepository) *GroupHandler {
	return &GroupHandler{
		GroupRepository:   gr,
		SessionRepository: sr,
		UserRepository:    ur,
	}
}

// Request DTOs
type CreateGroupRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

// Response DTOs
type GroupResponse struct {
	ID          int64  `json:"id"`
	CreatorID   int64  `json:"creator_id"`
	CreatorName string `json:"creator_name"`
	Title       string `json:"title"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// Helper function to get username by userID
func (h *GroupHandler) getUsernameByID(userID int64) (string, error) {
	user, err := h.UserRepository.GetByID(userID)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", fmt.Errorf("user not found")
	}

	return user.Username, nil
}

// CreateGroup handles the creation of a new group.
func (h *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	userName, err := h.getUsernameByID(userID)
	if err != nil {
		http.Error(w, "Failed to get user information: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var req CreateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	group := &models.Group{
		CreatorID:   userID,
		CreatorName: userName,
		Title:       req.Title,
		Description: &req.Description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	id, err := h.GroupRepository.Create(group)
	if err != nil {
		http.Error(w, "Failed to create group: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = h.GroupRepository.AddMember(group.ID, userID, userName, true, time.Now())
	if err != nil {
		http.Error(w, "Failed to add group creator as member: "+err.Error(), http.StatusInternalServerError)
		return
	}

	group.ID = id

	response := GroupResponse{
		ID:        group.ID,
		CreatorID: group.CreatorID,
		CreatorName: group.CreatorName,
		Title:     group.Title,
		Description: func() string {
			if group.Description != nil {
				return *group.Description
			}
			return ""
		}(),
		CreatedAt: group.CreatedAt.Format(time.RFC3339),
		UpdatedAt: group.UpdatedAt.Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *GroupHandler) GetGroupsByUserID(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	groups, err := h.GroupRepository.GetGroupsByUserID(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve groups: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var response []GroupResponse
	for _, group := range groups {
		response = append(response, GroupResponse{
			ID:          group.ID,
			CreatorID:   group.CreatorID,
			CreatorName: group.CreatorName,
			Title:       group.Title,
			Description: func() string {
				if group.Description != nil {
					return *group.Description
				}
				return ""
			}(),
			CreatedAt:   group.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   group.UpdatedAt.Format(time.RFC3339),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *GroupHandler) GetGroupByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Missing group ID in path", http.StatusBadRequest)
		return
	}

	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	group, err := h.GroupRepository.GetGroupByID(groupID)
	if err != nil {
		http.Error(w, "Failed to retrieve group: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if group == nil {
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}

	response := GroupResponse{
		ID:          group.ID,
		CreatorID:   group.CreatorID,
		CreatorName: group.CreatorName,
		Title:       group.Title,
		Description: func() string {
			if group.Description != nil {
				return *group.Description
			}
			return ""
		}(),
		CreatedAt:   group.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   group.UpdatedAt.Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *GroupHandler) GetMembersByGroupID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Missing group ID in path", http.StatusBadRequest)
		return
	}

	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	members, err := h.GroupRepository.GetMembersByGroupID(groupID)
	if err != nil {
		http.Error(w, "Failed to retrieve group members: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(members)
}

func (h *GroupHandler) AddMember(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Missing group ID in path", http.StatusBadRequest)
		return
	}

	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	var payload struct {
		UserID int64 `json:"user_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	userName, err := h.getUsernameByID(payload.UserID)
	if err != nil {
		http.Error(w, "Failed to get user information: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = h.GroupRepository.AddMember(groupID, payload.UserID, userName, true, time.Now())
	if err != nil {
		http.Error(w, "Failed to add member: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *GroupHandler) CreateGroupMessage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Missing group ID in path", http.StatusBadRequest)
		return
	}

	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	userID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	userName, err := h.getUsernameByID(userID)
	if err != nil {
		http.Error(w, "Failed to get user information: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var message models.GroupMessage
	if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	message.GroupID = groupID
	message.UserID = userID
	message.Username = userName
	message.CreatedAt = time.Now()
	message.UpdatedAt = time.Now()

	id, err := h.GroupRepository.CreateGroupMessage(&message)
	if err != nil {
		http.Error(w, "Failed to create group message: "+err.Error(), http.StatusInternalServerError)
		return
	}
	message.ID = id

	go BroadcastToGroupClients(message.GroupID, message)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(message)
}

func (h *GroupHandler) GetGroupMessages(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupIDStr := vars["id"]

	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	messages, err := h.GroupRepository.GetMessagesByGroupID(groupID)
	if err != nil {
		http.Error(w, "Failed to get messages: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

var groupClients = make(map[int64]map[*websocket.Conn]bool)
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (h *GroupHandler) CreateGroupPost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Missing group ID in path", http.StatusBadRequest)
		return
	}

	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	userID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	userName, err := h.getUsernameByID(userID)
	if err != nil {
		http.Error(w, "Failed to get user information: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var post models.GroupPost
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	post.GroupID = groupID
	post.UserID = userID
	post.Username = userName
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()
	post.CommentsCount = 0

	id, err := h.GroupRepository.CreateGroupPost(&post)
	if err != nil {
		http.Error(w, "Failed to create group post: "+err.Error(), http.StatusInternalServerError)
		return
	}
	post.ID = id

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (h *GroupHandler) GetPostsByGroupID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Missing group ID in path", http.StatusBadRequest)
		return
	}

	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	posts, err := h.GroupRepository.GetPostsByGroupID(groupID)
	if err != nil {
		http.Error(w, "Failed to retrieve group posts: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

func (h *GroupHandler) CreateGroupComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupPostIDStr, ok := vars["postID"]
	if !ok {
		http.Error(w, "Missing group post ID in path", http.StatusBadRequest)
		return
	}

	groupPostID, err := strconv.ParseInt(groupPostIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group post ID", http.StatusBadRequest)
		return
	}

	userID, ok := r.Context().Value(middlewares.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	userName, err := h.getUsernameByID(userID)
	if err != nil {
		http.Error(w, "Failed to get user information: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var comment models.GroupComment
	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	comment.GroupPostID = groupPostID
	comment.UserID = userID
	comment.Username = userName
	comment.CreatedAt = time.Now()
	comment.UpdatedAt = time.Now()

	id, err := h.GroupRepository.CreateGroupComment(&comment)
	if err != nil {
		http.Error(w, "Failed to create group comment: "+err.Error(), http.StatusInternalServerError)
		return
	}
	comment.ID = id

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comment)
}

func (h *GroupHandler) GetCommentsByGroupPostID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupPostIDStr, ok := vars["postID"]
	if !ok {
		http.Error(w, "Missing group post ID in path", http.StatusBadRequest)
		return
	}

	groupPostID, err := strconv.ParseInt(groupPostIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group post ID", http.StatusBadRequest)
		return
	}

	comments, err := h.GroupRepository.GetCommentsByPostID(groupPostID)
	if err != nil {
		http.Error(w, "Failed to retrieve group comments: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func HandleGroupWebSocket(w http.ResponseWriter, r *http.Request) {
	groupIDStr := r.URL.Query().Get("groupId")
	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrade WebSocket :", err)
		return
	}

	if groupClients[groupID] == nil {
		groupClients[groupID] = make(map[*websocket.Conn]bool)
	}
	groupClients[groupID][conn] = true

	go func() {
		defer func() {
			conn.Close()
			delete(groupClients[groupID], conn)
		}()

		for {
			var msg map[string]interface{}
			err := conn.ReadJSON(&msg)
			if err != nil {
				fmt.Println("Error read WS:", err)
				break
			}

			for c := range groupClients[groupID] {
				if c != conn {
					c.WriteJSON(msg)
				}
			}
		}
	}()
}

func BroadcastToGroupClients(groupID int64, message interface{}) {
	clients, ok := groupClients[groupID]
	if !ok {
		return
	}

	for c := range clients {
		err := c.WriteJSON(message)
		if err != nil {
			fmt.Println("Error broadcast WebSocket:", err)
			c.Close()
			delete(clients, c)
		}
	}
}