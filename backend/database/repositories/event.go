package repository

import (
	"database/sql"
	"time"

	"social-network/backend/database/models"
)

// Connection to the database
type EventRepository struct {
	db *sql.DB
}

// New Constructor for EventRepository
func NewEventRepository(db *sql.DB) *EventRepository {
	return &EventRepository{db: db}
}

// Create a new event in the database
func (r *EventRepository) CreateEvent(event *models.Event) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO events (group_id, creator_id, title, description, event_date, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		event.GroupID,
		event.CreatorID,
		event.Title,
		event.Description,
		event.EventDate,
		event.CreatedAt,
		event.UpdatedAt,
	)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

func (r *EventRepository) GetByID(eventID int64) (*models.Event, error) {
	var event models.Event
	err := r.db.QueryRow(`
		SELECT id, group_id, creator_id, title, description, event_date, created_at, updated_at
		FROM events
		WHERE id = ?
	`, eventID).Scan(
		&event.ID,
		&event.GroupID,
		&event.CreatorID,
		&event.Title,
		&event.Description,
		&event.EventDate,
		&event.CreatedAt,
		&event.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &event, nil
}

func (r *EventRepository) GetEventWithResponsesByID(eventID, userID int64) (*models.EventWithResponses, error) {
	var event models.EventWithResponses
	var userResponseStatus string

	err := r.db.QueryRow(`
		SELECT 
			e.id, e.group_id, e.creator_id, e.title, e.description, e.event_date, e.created_at, e.updated_at,
			COALESCE(user_response.status, '') as user_response_status
		FROM events e
		LEFT JOIN event_responses user_response ON e.id = user_response.event_id AND user_response.user_id = ?
		WHERE e.id = ?
	`, userID, eventID).Scan(
		&event.ID,
		&event.GroupID,
		&event.CreatorID,
		&event.Title,
		&event.Description,
		&event.EventDate,
		&event.CreatedAt,
		&event.UpdatedAt,
		&userResponseStatus,
	)
	if err != nil {
		return nil, err
	}

	// Set user response status if not empty
	if userResponseStatus != "" {
		event.UserResponseStatus = &userResponseStatus
	}

	// Get participants for this event
	participants, err := r.getEventParticipants(event.ID)
	if err != nil {
		return nil, err
	}
	if participants == nil {
		participants = []*models.EventParticipant{}
	}
	event.Participants = participants

	// Get non-participants for this event
	nonParticipants, err := r.getEventNonParticipants(event.ID)
	if err != nil {
		return nil, err
	}
	if nonParticipants == nil {
		nonParticipants = []*models.EventParticipant{}
	}
	event.NonParticipants = nonParticipants

	return &event, nil
}

func (r *EventRepository) SetEventResponse(eventID, userID int64, status string) error {
	_, err := r.db.Exec(`
		INSERT INTO event_responses (event_id, user_id, status, created_at)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(event_id, user_id) DO UPDATE SET status = excluded.status
	`, eventID, userID, status, time.Now())
	return err
}

func (r *EventRepository) GetEventsByGroupID(groupID int64) ([]*models.Event, error) {
	rows, err := r.db.Query(`
		SELECT id, group_id, creator_id, title, description, event_date, created_at, updated_at
		FROM events
		WHERE group_id = ?
		ORDER BY event_date ASC
	`, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*models.Event
	for rows.Next() {
		var event models.Event
		err := rows.Scan(
			&event.ID,
			&event.GroupID,
			&event.CreatorID,
			&event.Title,
			&event.Description,
			&event.EventDate,
			&event.CreatedAt,
			&event.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, &event)
	}

	return events, nil
}

func (r *EventRepository) GetEventsWithResponsesByGroupID(groupID, userID int64) ([]*models.EventWithResponses, error) {
	rows, err := r.db.Query(`
		SELECT 
			e.id, e.group_id, e.creator_id, e.title, e.description, e.event_date, e.created_at, e.updated_at,
			COALESCE(user_response.status, '') as user_response_status
		FROM events e
		LEFT JOIN event_responses user_response ON e.id = user_response.event_id AND user_response.user_id = ?
		WHERE e.group_id = ?
		ORDER BY e.event_date ASC
	`, userID, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*models.EventWithResponses
	for rows.Next() {
		var event models.EventWithResponses
		var userResponseStatus string
		err := rows.Scan(
			&event.ID,
			&event.GroupID,
			&event.CreatorID,
			&event.Title,
			&event.Description,
			&event.EventDate,
			&event.CreatedAt,
			&event.UpdatedAt,
			&userResponseStatus,
		)
		if err != nil {
			return nil, err
		}

		if userResponseStatus != "" {
			event.UserResponseStatus = &userResponseStatus
		}

		// Get participants for this event
		participants, err := r.getEventParticipants(event.ID)
		if err != nil {
			return nil, err
		}
		if participants == nil {
			participants = []*models.EventParticipant{}
		}
		event.Participants = participants

		// Get non-participants for this event
		nonParticipants, err := r.getEventNonParticipants(event.ID)
		if err != nil {
			return nil, err
		}
		if nonParticipants == nil {
			nonParticipants = []*models.EventParticipant{}
		}
		event.NonParticipants = nonParticipants

		events = append(events, &event)
	}

	return events, nil
}

func (r *EventRepository) getEventParticipants(eventID int64) ([]*models.EventParticipant, error) {
	rows, err := r.db.Query(`
		SELECT u.id, u.username
		FROM event_responses er
		JOIN users u ON er.user_id = u.id
		WHERE er.event_id = ? AND er.status = 'going'
		ORDER BY u.username
	`, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var participants []*models.EventParticipant
	for rows.Next() {
		var participant models.EventParticipant
		err := rows.Scan(&participant.UserID, &participant.Username)
		if err != nil {
			return nil, err
		}
		participants = append(participants, &participant)
	}

	// Ensure we return an empty slice instead of nil
	if participants == nil {
		participants = []*models.EventParticipant{}
	}

	return participants, nil
}

func (r *EventRepository) getEventNonParticipants(eventID int64) ([]*models.EventParticipant, error) {
	rows, err := r.db.Query(`
		SELECT u.id, u.username
		FROM event_responses er
		JOIN users u ON er.user_id = u.id
		WHERE er.event_id = ? AND er.status = 'not_going'
		ORDER BY u.username
	`, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nonParticipants []*models.EventParticipant
	for rows.Next() {
		var participant models.EventParticipant
		err := rows.Scan(&participant.UserID, &participant.Username)
		if err != nil {
			return nil, err
		}
		nonParticipants = append(nonParticipants, &participant)
	}

	// Ensure we return an empty slice instead of nil
	if nonParticipants == nil {
		nonParticipants = []*models.EventParticipant{}
	}

	return nonParticipants, nil
}

func (r *EventRepository) DeleteEvent(eventID int64) error {
	_, err := r.db.Exec(`
		DELETE FROM events
		WHERE id = ?
	`, eventID)
	return err
}
