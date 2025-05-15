package repository

import (
	"database/sql"

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
func (r *EventRepository) Create(event *models.Event) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO events(
			group_id, creator_id, title, description, event_date, created_at
		) VALUES(?, ?, ?, ?, ?, ?)
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
	)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	event.ID = id
	return id, nil

}

// Get an event by ID
func (r *EventRepository) GetByID(id int64) (*models.Event, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, group_id, creator_id, title, description, event_date, created_at
		FROM events WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	event := &models.Event{}
	err = stmt.QueryRow(id).Scan(
		&event.ID,
		&event.GroupID,
		&event.CreatorID,
		&event.Title,
		&event.Description,
		&event.EventDate,
		&event.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return event, nil
}

// Get all events for a group
func (r *EventRepository) GetAllByGroupID(groupID int64) ([]*models.Event, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, group_id, creator_id, title, description, event_date, created_at
		FROM events WHERE group_id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*models.Event
	for rows.Next() {
		event := &models.Event{}
		err = rows.Scan(
			&event.ID,
			&event.GroupID,
			&event.CreatorID,
			&event.Title,
			&event.Description,
			&event.EventDate,
			&event.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}

	return events, nil
}

// Update an event in the database
func (r *EventRepository) Update(event *models.Event) error {
	stmt, err := r.db.Prepare(`
		UPDATE events SET
			group_id = ?, creator_id = ?, title = ?, description = ?, event_date = ?
		WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		event.GroupID,
		event.CreatorID,
		event.Title,
		event.Description,
		event.EventDate,
		event.ID,
	)
	return err
}

// Delete an event from the database
func (r *EventRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM events WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(id)
	return err
}
