package repository

import "social-network/backend/database/models"

type EventRepositoryInterface interface {
	// Create a new event
	CreateEvent(event *models.Event) (int64, error)
	
	// Set user response to an event (going/not_going)
	SetEventResponse(eventID, userID int64, status string) error
	
	// Get all responses for a specific event with user information
	GetEventResponses(eventID int64) ([]models.EventResponse, error)
	
	// Get all events for a specific group
	GetEventsByGroupID(groupID int64) ([]*models.Event, error)
	
	// Delete an event by ID
	DeleteEvent(eventID int64) error
	
	// Message management
	CreateEventMessage(eventMessage *models.EventMessage) (int64, error)
	GetMessagesByEventID(eventID int64) ([]models.EventMessage, error)
}