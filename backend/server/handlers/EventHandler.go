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

	"github.com/gorilla/mux"
)

// EventHandler handles HTTP requests related to events.
type EventHandler struct {
	EventRepository *repository.EventRepository
	GroupRepository *repository.GroupRepository
}

// NewEventHandler creates a new EventHandler.
func NewEventHandler(er *repository.EventRepository, gr *repository.GroupRepository) *EventHandler {
	return &EventHandler{
		EventRepository: er,
		GroupRepository: gr,
	}
}

// Request DTOs

type createEventRequest struct {
	GroupID     int64     `json:"group_id"`
	CreatorID   int64     `json:"creator_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	EventDate   time.Time `json:"event_date"`
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

	// Get the event to find the group ID
	event, err := h.EventRepository.GetByID(eventID)
	if err != nil {
		http.Error(w, "Failed to get event: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Get updated event with participants for broadcast
	updatedEvent, err := h.EventRepository.GetEventWithResponsesByID(eventID, userID)
	if err == nil {
		// Broadcast the updated event data to all group members
		broadcastData := map[string]interface{}{
			"type":  "event_response_update",
			"event": updatedEvent,
		}

		// Use the existing BroadcastToGroupClients function
		BroadcastToGroupClients(event.GroupID, broadcastData)
	} else {
		fmt.Printf("❌ Error getting updated event: %v\n", err)
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

	userID := r.Context().Value(middlewares.UserIDKey).(int64)

	events, err := h.EventRepository.GetEventsWithResponsesByGroupID(groupID, userID)
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
