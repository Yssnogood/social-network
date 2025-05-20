package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"social-network/backend/database/models"
	"social-network/backend/database/repositories"
)

// EventHandler handles HTTP requests related to events.
type EventHandler struct {
	EventRepository *repository.EventRepository
}

// NewEventHandler creates a new EventHandler.
func NewEventHandler(er *repository.EventRepository) *EventHandler {
	return &EventHandler{
		EventRepository: er,
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

type updateEventRequest struct {
	ID          int64     `json:"id"`
	GroupID     int64     `json:"group_id"`
	CreatorID   int64     `json:"creator_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	EventDate   time.Time `json:"event_date"`
}

type getEventByIDRequest struct {
	ID int64 `json:"id"`
}

type getEventsByGroupRequest struct {
	GroupID int64 `json:"group_id"`
}

type deleteEventRequest struct {
	ID int64 `json:"id"`
}

// Handlers

// CreateEvent handles the creation of a new event.
func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var req createEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	event := &models.Event{
		GroupID:     req.GroupID,
		CreatorID:   req.CreatorID,
		Title:       req.Title,
		Description: req.Description,
		EventDate:   req.EventDate,
		CreatedAt:   time.Now(),
	}

	id, err := h.EventRepository.Create(event)
	if err != nil {
		http.Error(w, "Failed to create event", http.StatusInternalServerError)
		return
	}

	event.ID = id
	json.NewEncoder(w).Encode(event)
}

// GetEventByID retrieves an event by ID.
func (h *EventHandler) GetEventByID(w http.ResponseWriter, r *http.Request) {
	var req getEventByIDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	event, err := h.EventRepository.GetByID(req.ID)
	if err != nil {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(event)
}

// GetEventsByGroup retrieves all events for a group.
func (h *EventHandler) GetEventsByGroup(w http.ResponseWriter, r *http.Request) {
	var req getEventsByGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	events, err := h.EventRepository.GetAllByGroupID(req.GroupID)
	if err != nil {
		http.Error(w, "Failed to retrieve events", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(events)
}

// UpdateEvent handles event updates.
func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	var req updateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	event := &models.Event{
		ID:          req.ID,
		GroupID:     req.GroupID,
		CreatorID:   req.CreatorID,
		Title:       req.Title,
		Description: req.Description,
		EventDate:   req.EventDate,
	}

	if err := h.EventRepository.Update(event); err != nil {
		http.Error(w, "Failed to update event", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Event updated successfully",
	})
}

// DeleteEvent deletes an event by ID.
func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	var req deleteEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := h.EventRepository.Delete(req.ID); err != nil {
		http.Error(w, "Failed to delete event", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Event deleted successfully",
	})
}
