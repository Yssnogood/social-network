package repository

import (
	"database/sql"
	"social-network/backend/database/models"
)

type TypingStatusRepository struct {
	db *sql.DB
}

func NewTypingStatusRepository(db *sql.DB) *TypingStatusRepository {
	return &TypingStatusRepository{db: db}
}

// Create
func (r *TypingStatusRepository) Create(typingStatus *models.TypingStatus) (*models.TypingStatus, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO typing_status(conversation_id, user_id, last_updated)
		VALUES (?, ?, ?)
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	result, err := stmt.Exec(typingStatus.ConversationID, typingStatus.UserID, typingStatus.LastUpdate)
	if err != nil {
		return nil, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	typingStatus.ID = id
	return typingStatus, nil
}

// GetByID
func (r *TypingStatusRepository) GetByID(id int64) (*models.TypingStatus, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, conversation_id, user_id, last_updated
		FROM typing_status WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	typingStatus := &models.TypingStatus{}
	err = stmt.QueryRow(id).Scan(&typingStatus.ID, &typingStatus.ConversationID, &typingStatus.UserID, &typingStatus.LastUpdate)
	if err != nil {
		return nil, err
	}

	return typingStatus, nil
}

// GetByConversationID
func (r *TypingStatusRepository) GetByConversationID(conversationID int64) ([]*models.TypingStatus, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, conversation_id, user_id, last_updated
		FROM typing_status WHERE conversation_id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(conversationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var typingStatuses []*models.TypingStatus
	for rows.Next() {
		typingStatus := &models.TypingStatus{}
		err = rows.Scan(&typingStatus.ID, &typingStatus.ConversationID, &typingStatus.UserID, &typingStatus.LastUpdate)
		if err != nil {
			return nil, err
		}
		typingStatuses = append(typingStatuses, typingStatus)
	}

	return typingStatuses, nil
}

// GetByUserID
func (r *TypingStatusRepository) GetByUserID(userID int64) ([]*models.TypingStatus, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, conversation_id, user_id, last_updated
		FROM typing_status WHERE user_id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var typingStatuses []*models.TypingStatus
	for rows.Next() {
		typingStatus := &models.TypingStatus{}
		err = rows.Scan(&typingStatus.ID, &typingStatus.ConversationID, &typingStatus.UserID, &typingStatus.LastUpdate)
		if err != nil {
			return nil, err
		}
		typingStatuses = append(typingStatuses, typingStatus)
	}

	return typingStatuses, nil
}

//Update
func (r *TypingStatusRepository) Update(typingStatus *models.TypingStatus) (*models.TypingStatus, error) {
	stmt, err := r.db.Prepare(`
		UPDATE typing_status
		SET conversation_id = ?, user_id = ?, last_updated = ?
		WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(typingStatus.ConversationID, typingStatus.UserID, typingStatus.LastUpdate, typingStatus.ID)
	if err != nil {
		return nil, err
	}

	return typingStatus, nil
}

// Delete
func (r *TypingStatusRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM typing_status WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	if err != nil {
		return err
	}

	return nil
}
