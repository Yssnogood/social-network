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

// Create
func (r *ConversationMembersRepository) Create(conversationMember *models.ConversationMembers) (*models.ConversationMembers, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO conversation_members(conversation_id, user_id, joined_at)
		VALUES (?, ?, ?)
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(conversationMember.ConversationID, conversationMember.UserID, conversationMember.JoinedAt)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	conversationMember.ID = id
	return conversationMember, nil
}
// GetByID
func (r *ConversationMembersRepository) GetByID(id int64) (*models.ConversationMembers, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, conversation_id, user_id, joined_at
		FROM conversation_members WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	conversationMember := &models.ConversationMembers{}
	err = stmt.QueryRow(id).Scan(&conversationMember.ID, &conversationMember.ConversationID, &conversationMember.UserID, &conversationMember.JoinedAt)
	if err != nil {
		return nil, err
	}

	return conversationMember, nil
}
// GetByConversationID
func (r *ConversationMembersRepository) GetByConversationID(conversationID int64) ([]*models.ConversationMembers, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, conversation_id, user_id, joined_at
		FROM conversation_members WHERE conversation_id = ?
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

	var members []*models.ConversationMembers
	for rows.Next() {
		member := &models.ConversationMembers{}
		err = rows.Scan(&member.ID, &member.ConversationID, &member.UserID, &member.JoinedAt)
		if err != nil {
			return nil, err
		}
		members = append(members, member)
	}

	return members, nil
}
// GetByUserID
func (r *ConversationMembersRepository) GetByUserID(userID int64) ([]*models.ConversationMembers, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, conversation_id, user_id, joined_at
		FROM conversation_members WHERE user_id = ?
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

	var members []*models.ConversationMembers
	for rows.Next() {
		member := &models.ConversationMembers{}
		err = rows.Scan(&member.ID, &member.ConversationID, &member.UserID, &member.JoinedAt)
		if err != nil {
			return nil, err
		}
		members = append(members, member)
	}

	return members, nil
}

// Delete
func (r *ConversationMembersRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM conversation_members WHERE id = ?
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