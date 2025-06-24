package repository

import (
	"database/sql"
	"time"

	"social-network/backend/database/models"
)

type MessageRepository struct {
	db *sql.DB
}

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
		SELECT id, conversation_id, sender_id, receiver_id, group_id, content, created_at, read_at
		FROM messages WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	message := &models.Message{}
	err = stmt.QueryRow(id).Scan(
		&message.ID,
		&message.ConversationID,
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

// Get messages between two users (deprecated - use GetMessagesByConversation instead)
func (r *MessageRepository) GetMessagesBetweenUsers(user1ID, user2ID int64) ([]*models.Message, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, conversation_id, sender_id, receiver_id, group_id, content, created_at, read_at
		FROM messages
		WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
		ORDER BY created_at ASC
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
			&message.ConversationID,
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

func (r *MessageRepository) GetMessagesByConversationID(conversationID int64) ([]*models.Message, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, conversation_id, sender_id, receiver_id, group_id, content, created_at, read_at
		FROM messages
		WHERE conversation_id = ?
		ORDER BY created_at ASC
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

	var messages []*models.Message
	for rows.Next() {
		message := &models.Message{}
		err := rows.Scan(
			&message.ID,
			&message.ConversationID,
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

// Update a message in the database
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
	return err
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
	return err
}

// MarkAsRead marks a message as read with timestamp
func (r *MessageRepository) MarkAsRead(messageID int64, readAt time.Time) error {
	stmt, err := r.db.Prepare(`
		UPDATE messages SET read_at = ? WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(readAt, messageID)
	return err
}

// GetConversationID retrieves the conversation ID of a message
func (r *MessageRepository) GetConversationID(messageID int64) (int64, error) {
	stmt, err := r.db.Prepare(`
		SELECT conversation_id FROM messages WHERE id = ?
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	var conversationID int64
	err = stmt.QueryRow(messageID).Scan(&conversationID)
	return conversationID, err
}