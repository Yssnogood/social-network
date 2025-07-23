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

type ConversationResponse struct {
	Members      []*models.User       `json:"members"`
	Messages     []*models.Message    `json:"messages"`
	Conversation *models.Conversation `json:"conversation"`
}

// Create a new conversation
func (r *ConversationRepository) Create(convo *models.Conversation) (*models.Conversation, error) {
	now := time.Now()

	stmt, err := r.db.Prepare(`
		INSERT INTO conversations(name, is_group, created_at, updated_at)
		VALUES (?, ?, ?, ?)
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(convo.Name, convo.IsGroup, now, now)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	convo.ID = id
	convo.CreatedAt = now
	convo.UpdatedAt = now
	return convo, nil

}

// GetByID retrieves a conversation by ID
func (r *ConversationRepository) GetByID(id int64) (*models.Conversation, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, name, is_group, created_at, updated_at
		FROM conversations WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	convo := &models.Conversation{}
	err = stmt.QueryRow(id).Scan(
		&convo.ID,
		&convo.Name,
		&convo.IsGroup,
		&convo.CreatedAt,
		&convo.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return convo, nil
}

// GetByName retrieves a conversation by name
func (r *ConversationRepository) GetByName(name string) (*models.Conversation, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, name, is_group, created_at, updated_at
		FROM conversations WHERE name = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	convo := &models.Conversation{}
	err = stmt.QueryRow(name).Scan(
		&convo.ID,
		&convo.Name,
		&convo.IsGroup,
		&convo.CreatedAt,
		&convo.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return convo, nil
}

// UpdatedAt updates the updated_at timestamp
func (r *ConversationRepository) UpdatedAt(id int64) (*models.Conversation, error) {
	now := time.Now()
	stmt, err := r.db.Prepare(`
		UPDATE conversations SET updated_at = ? WHERE id = ?
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

// Delete removes a conversation
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

// GetMembers retrieves all members of a conversation
func (r *ConversationRepository) GetMembers(conversationID int64) ([]models.ConversationMembers, error) {
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

	var members []models.ConversationMembers
	for rows.Next() {
		member := models.ConversationMembers{}
		err := rows.Scan(
			&member.ID,
			&member.ConversationID,
			&member.UserID,
			&member.JoinedAt,
		)
		if err != nil {
			return nil, err
		}
		members = append(members, member)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return members, nil
}

// Exists checks if a conversation already exists
func (r *ConversationRepository) Exists(name string) (bool, error) {
	stmt, err := r.db.Prepare(`
		SELECT COUNT(*) FROM conversations WHERE name = ?
	`)
	if err != nil {
		return false, err
	}
	defer stmt.Close()

	var count int
	err = stmt.QueryRow(name).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// CreateOrGetPrivateConversation creates or retrieves existing private conversation between two users
func (r *ConversationRepository) CreateOrGetPrivateConversation(initiator, recipient int64) (*models.Conversation, error) {
	// Check if conversation already exists
	membersRepo := NewConversationMembersRepository(r.db)
	existingConv, err := membersRepo.AreUsersInSameConversation(initiator, recipient)
	if err != nil {
		return nil, err
	}

	if existingConv != nil {
		return existingConv, nil
	}

	// Create new private conversation
	conv := &models.Conversation{
		Name:    "",
		IsGroup: false,
	}

	newConv, err := r.Create(conv)
	if err != nil {
		return nil, err
	}

	err = membersRepo.AddMember(newConv.ID, initiator)
	if err != nil {
		return nil, err
	}

	err = membersRepo.AddMember(newConv.ID, recipient)
	if err != nil {
		return nil, err
	}

	return newConv, nil
}

func (r *ConversationRepository) GetConversationByUserID(userID int64) ([]ConversationResponse, error) {
	stmt, err := r.db.Prepare(`
	SELECT * FROM conversations WHERE user_id = ?;
	`)
	if err != nil {
		return nil, err
	}
	var conversations []ConversationResponse
	rows, err := stmt.Query(userID)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var conversation = ConversationResponse{Conversation: &models.Conversation{}}
		rows.Scan(
			&conversation.Conversation.ID,
			&conversation.Conversation.Name,
			&conversation.Conversation.IsGroup,
			&conversation.Conversation.CreatedAt,
			&conversation.Conversation.UpdatedAt)
		members, _ := r.GetMembers(conversation.Conversation.ID)
		for _, member := range members {
			conversation.Members = append(conversation.Members, r.getMemberData(member.UserID))
		}
	}
	return conversations, nil
}

func (r *ConversationRepository) getMemberData(userID int64) *models.User {
	stmt, _ := r.db.Prepare(`
	SELECT id,username FROM users WHERE id = ?;
	`)
	var user = &models.User{}
	stmt.QueryRow(userID).Scan(&user.ID, &user.Username)
	return user
}
