package repository

import (
	"database/sql"
	"time"

	"social-network/backend/database/models"
)

type ConversationRepository struct {
	db *sql.DB
}

func NewConversationRepository(db *sql.DB) *ConversationRepository {
	return &ConversationRepository{db: db}
}

// Create
func (r *ConversationRepository) Create(convo *models.Conversation) (*models.Conversation, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO conversations(name, is_group, created_at)
		VALUES (?, ?, ?)
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	convo.CreatedAt = time.Now()

	result, err := stmt.Exec(convo.Name, convo.IsGroup, convo.CreatedAt)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	convo.ID = id
	return convo, nil
}

// GetByID
func (r *ConversationRepository) GetByID(id int64) (*models.Conversation, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, name, is_group, created_at
		FROM conversations WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	convo := &models.Conversation{}
	err = stmt.QueryRow(id).Scan(&convo.ID, &convo.Name, &convo.IsGroup, &convo.CreatedAt)
	if err != nil {
		return nil, err
	}

	return convo, nil
}

// GetByName
func (r *ConversationRepository) GetByName(name string) (*models.Conversation, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, name, is_group, created_at
		FROM conversations WHERE name = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	convo := &models.Conversation{}
	err = stmt.QueryRow(name).Scan(&convo.ID, &convo.Name, &convo.IsGroup, &convo.CreatedAt)
	if err != nil {
		return nil, err
	}

	return convo, nil
}

// Update
func (r *ConversationRepository) UpdatedAt(id int64) (*models.Conversation, error) {
	now := time.Now()
	stmt, err := r.db.Prepare(`
		UPDATE conversations SET created_at = ? WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(now, id)
	if err != nil {
		return nil, err
	}

	return r.GetByID(id)
}

// Delete
func (r *ConversationRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM conversations WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	return err
}
