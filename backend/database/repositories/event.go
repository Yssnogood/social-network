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
		INSERT INTO events (group_id, creator_id, title, description, event_date, location, image_path, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
		event.Location,
		event.ImagePath,
		event.CreatedAt,
		event.UpdatedAt,
	)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

func (r *EventRepository) SetEventResponse(eventID, userID int64, status string) error {
	_, err := r.db.Exec(`
		INSERT INTO event_responses (event_id, user_id, status, created_at)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(event_id, user_id) DO UPDATE SET status = excluded.status
	`, eventID, userID, status, time.Now())
	return err
}

// Get all responses for a specific event
func (r *EventRepository) GetEventResponses(eventID int64) ([]models.EventResponse, error) {
	rows, err := r.db.Query(`
		SELECT er.event_id, er.user_id, er.status, er.created_at, u.username
		FROM event_responses er
		JOIN users u ON er.user_id = u.id
		WHERE er.event_id = ?
		ORDER BY er.created_at ASC
	`, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var responses []models.EventResponse
	for rows.Next() {
		var response models.EventResponse
		err := rows.Scan(
			&response.EventID,
			&response.UserID,
			&response.Status,
			&response.CreatedAt,
			&response.Username,
		)
		if err != nil {
			return nil, err
		}
		responses = append(responses, response)
	}

	return responses, nil
}

func (r *EventRepository) GetEventsByGroupID(groupID int64) ([]*models.Event, error) {
	rows, err := r.db.Query(`
		SELECT id, group_id, creator_id, title, description, event_date, location, image_path, created_at, updated_at
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
			&event.Location,
			&event.ImagePath,
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

func ( r * EventRepository) DeleteEvent(eventID int64) error {
	_, err := r.db.Exec(`
		DELETE FROM events
		WHERE id = ?
	`, eventID)
	return err
}

// Create a new event message in the database
func (r *EventRepository) CreateEventMessage(eventMessage *models.EventMessage) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO event_messages (event_id, user_id, username, content, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()
	
	result, err := stmt.Exec(
		eventMessage.EventID,
		eventMessage.UserID,
		eventMessage.Username,
		eventMessage.Content,
		eventMessage.CreatedAt,
		eventMessage.UpdatedAt,
	)
	if err != nil {
		return 0, err
	}
	
	return result.LastInsertId()
}

// Get all messages for a specific event
func (r *EventRepository) GetMessagesByEventID(eventID int64) ([]models.EventMessage, error) {
	rows, err := r.db.Query(`
		SELECT id, event_id, user_id, username, content, created_at, updated_at
		FROM event_messages
		WHERE event_id = ?
		ORDER BY created_at ASC
	`, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var messages []models.EventMessage
	for rows.Next() {
		var message models.EventMessage
		err := rows.Scan(
			&message.ID,
			&message.EventID,
			&message.UserID,
			&message.Username,
			&message.Content,
			&message.CreatedAt,
			&message.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}
	
	return messages, nil
}