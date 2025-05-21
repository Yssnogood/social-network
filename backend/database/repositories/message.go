package repository

import (
	"database/sql"

	"social-network/backend/database/models"
)

// Connection to the database
type MessageRepository struct {
	db *sql.DB
}

// New Constructor for MessageRepository
func NewMessageRepository(db *sql.DB) *MessageRepository {
	return &MessageRepository{db: db}
}

// Create a new message in the database
func (r *MessageRepository) Create(message *models.Message) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO messages(
			conversation_id, sender_id, receiver_id, group_id, content, created_at
		) VALUES(?, ?, ?, ?, ?, ?)
	`)

	if err != nil {
		return 0, err
	}
	defer stmt.Close()
	result, err := stmt.Exec(
		message.ConversationID,
		message.SenderID,
		message.ReceiverID,
		message.GroupID,
		message.Content,
		message.CreatedAt,
	)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	message.ID = id
	return id, nil
}

// Get a message by ID
func (r *MessageRepository) GetByID(id int64) (*models.Message, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, sender_id, receiver_id, group_id, content, created_at, read_at
		FROM messages WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	message := &models.Message{}
	err = stmt.QueryRow(id).Scan(
		&message.ID,
		&message.SenderID,
		&message.ReceiverID,
		&message.GroupID,
		&message.Content,
		&message.CreatedAt,
		&message.ReadAt,
	)
	if err != nil {
		return nil, err
	}
	return message, nil
}

// Get messages between two users
func (r *MessageRepository) GetMessagesBetweenUsers(user1ID, user2ID int64) ([]*models.Message, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, sender_id, receiver_id, group_id, content, created_at, read_at
		FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(user1ID, user2ID, user2ID, user1ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*models.Message
	for rows.Next() {
		message := &models.Message{}
		err := rows.Scan(
			&message.ID,
			&message.SenderID,
			&message.ReceiverID,
			&message.GroupID,
			&message.Content,
			&message.CreatedAt,
			&message.ReadAt,
		)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return messages, nil
}

// update a message in the database
func (r *MessageRepository) Update(message *models.Message) error {
	stmt, err := r.db.Prepare(`
		UPDATE messages SET
			content = ?, read_at = ?
		WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		message.Content,
		message.ReadAt,
		message.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

// Delete a message from the database
func (r *MessageRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM messages WHERE id = ?
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

