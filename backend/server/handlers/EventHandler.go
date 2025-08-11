package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"social-network/backend/database/models"
	repository "social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
	"social-network/backend/websocket"

	"github.com/gorilla/mux"
)

// EventHandler handles HTTP requests related to events.
type EventHandler struct {
	EventRepository *repository.EventRepository
	UserRepository  repository.UserRepositoryInterface
	Hub             *websocket.Hub // 🎯 Ajout du Hub WebSocket pour broadcast temps réel
}

// NewEventHandler creates a new EventHandler instance
func NewEventHandler(eventRepo *repository.EventRepository, userRepo repository.UserRepositoryInterface, hub *websocket.Hub) *EventHandler {
	return &EventHandler{
		EventRepository: eventRepo,
		UserRepository:  userRepo,
		Hub:             hub,
	}
}


// Request DTOs

type createEventRequest struct {
	GroupID     int64     `json:"group_id"`
	CreatorID   int64     `json:"creator_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	EventDate   time.Time `json:"event_date"`
	Location    *string   `json:"location,omitempty"`
	ImagePath   *string   `json:"image_path,omitempty"`
}
type setEventResponseRequest struct {
	EventID int64  `json:"event_id"`
	UserID  int64  `json:"user_id"`
	Status  string `json:"status"` // "going" or "not_going"
}

// Handlers

// CreateEvent handles the creation of a new event.
func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupIDStr := vars["id"]
	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value(middlewares.UserIDKey).(int64)

	var event models.Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	event.GroupID = groupID
	event.CreatorID = userID
	event.Location = event.Location    // This will be set from JSON decoding
	event.ImagePath = event.ImagePath  // This will be set from JSON decoding
	event.CreatedAt = time.Now()
	event.UpdatedAt = time.Now()

	id, err := h.EventRepository.CreateEvent(&event)
	if err != nil {
		http.Error(w, "Failed to create event: "+err.Error(), http.StatusInternalServerError)
		return
	}
	event.ID = id

	json.NewEncoder(w).Encode(event)
}

func (h *EventHandler) SetEventResponse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventID, err := strconv.ParseInt(vars["eventID"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value(middlewares.UserIDKey).(int64)

	var payload struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || (payload.Status != "going" && payload.Status != "not_going") {
		http.Error(w, "Invalid status", http.StatusBadRequest)
		return
	}

	err = h.EventRepository.SetEventResponse(eventID, userID, payload.Status)
	if err != nil {
		http.Error(w, "Failed to set response: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *EventHandler) GetEventsByGroupID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupIDStr := vars["id"]
	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	events, err := h.EventRepository.GetEventsByGroupID(groupID)
	if err != nil {
		http.Error(w, "Failed to fetch events: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventIDStr := vars["eventID"]
	eventID, err := strconv.ParseInt(eventIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}

	err = h.EventRepository.DeleteEvent(eventID)
	if err != nil {
		http.Error(w, "Failed to delete event: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Message handlers

// CreateEventMessage handles the creation of a new event message
func (h *EventHandler) CreateEventMessage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventIDStr := vars["eventID"]
	eventID, err := strconv.ParseInt(eventIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value(middlewares.UserIDKey).(int64)
	userName, err := h.getUsernameByID(userID)
	if err != nil {
		http.Error(w, "Failed to get user information: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var message models.EventMessage
	if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	message.EventID = eventID
	message.UserID = userID
	message.Username = userName
	message.CreatedAt = time.Now()
	message.UpdatedAt = time.Now()

	id, err := h.EventRepository.CreateEventMessage(&message)
	if err != nil {
		http.Error(w, "Failed to create event message: "+err.Error(), http.StatusInternalServerError)
		return
	}
	message.ID = id

	// 🎯 BROADCAST VIA WEBSOCKET APRÈS SAUVEGARDE DB
	if h.Hub != nil {
		wsMessage := websocket.WSMessage{
			Type:      "event_message_received",
			EventID:   eventID,
			Content:   message.Content,
			SenderID:  userID,
			Username:  userName,
			MessageID: id,
			Timestamp: message.CreatedAt,
		}
		
		// Broadcast vers tous les clients connectés à cet événement
		h.Hub.BroadcastToEvent(eventID, wsMessage)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(message)
}

// GetEventMessages retrieves all messages for a specific event
func (h *EventHandler) GetEventMessages(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventIDStr := vars["eventID"]
	eventID, err := strconv.ParseInt(eventIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}

	messages, err := h.EventRepository.GetMessagesByEventID(eventID)
	if err != nil {
		http.Error(w, "Failed to get messages: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// getUsernameByID retrieves username from user ID
func (h *EventHandler) getUsernameByID(userID int64) (string, error) {
	user, err := h.UserRepository.GetByID(userID)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", fmt.Errorf("user not found")
	}
	return user.Username, nil
}
