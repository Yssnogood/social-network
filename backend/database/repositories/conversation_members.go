package repository

import (
	"database/sql"
	"social-network/backend/database/models"
)

type ConversationMembersRepository struct {
	db *sql.DB
}

func NewConversationMembersRepository(db *sql.DB) *ConversationMembersRepository {
	return &ConversationMembersRepository{db: db}
}

// AddMember adds a user to a conversation
func (r *ConversationMembersRepository) AddMember(conversationID, userID int64) error {
	stmt, err := r.db.Prepare(`
		INSERT INTO conversation_members(conversation_id, user_id)
		VALUES (?, ?)
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(conversationID, userID)
	return err
}

// GetConversationsByUser retrieves all conversation IDs for a user
func (r *ConversationMembersRepository) GetConversationsByUser(userID int64) ([]int64, error) {
	stmt, err := r.db.Prepare(`
		SELECT conversation_id FROM conversation_members
		WHERE user_id = ?
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

	var conversationIDs []int64
	for rows.Next() {
		var convID int64
		if err := rows.Scan(&convID); err != nil {
			return nil, err
		}
		conversationIDs = append(conversationIDs, convID)
	}

	return conversationIDs, nil
}

// AreUsersInSameConversation checks if two users are in the same conversation
func (r *ConversationMembersRepository) AreUsersInSameConversation(userID1, userID2 int64) (*models.Conversation, error) {
	stmt, err := r.db.Prepare(`
		SELECT c.id, c.name, c.is_group, c.created_at, c.updated_at
		FROM conversations c
		JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = ?
		JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = ?
		where c.is_group = false
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	var conv models.Conversation
	err = stmt.QueryRow(userID1, userID2).Scan(&conv.ID, &conv.Name, &conv.IsGroup, &conv.CreatedAt, &conv.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &conv, nil
}
