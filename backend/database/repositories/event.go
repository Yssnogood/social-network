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

func ( r * EventRepository) DeleteEvent(eventID int64) error {
	_, err := r.db.Exec(`
		DELETE FROM events
		WHERE id = ?
	`, eventID)
	return err
}