package repository

import (
	"database/sql"
	"time"

	"social-network/backend/database/models"
)

// Connection to the database
type GroupRepository struct {
	db *sql.DB
}

// New Constructor for GroupRepository
func NewGroupRepository(db *sql.DB) *GroupRepository {
	return &GroupRepository{db: db}
}

// Create a new group in the database
func (r *GroupRepository) Create(group *models.Group) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO groups(
			creator_id, title, description, created_at, updated_at
		) VALUES(?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		group.CreatorID,
		group.Title,
		group.Description,
		group.CreatedAt,
		group.UpdatedAt,
	)

	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	group.ID = id
	return id, nil
}

// AddMember ajoute un utilisateur dans un groupe
func (r *GroupRepository) AddMember(groupID, userID int64, accepted bool, createdAt time.Time) error {
	stmt, err := r.db.Prepare(`
		INSERT INTO group_members (group_id, user_id, accepted, created_at)
		VALUES (?, ?, ?, ?)
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(groupID, userID, accepted, createdAt)
	return err
}

func (r *GroupRepository) GetGroupsByUserID(userID int64) ([]models.Group, error) {
	stmt, err := r.db.Prepare(`
		SELECT g.id, g.creator_id, g.title, g.description, g.created_at, g.updated_at
		FROM groups g
		JOIN group_members gm ON g.id = gm.group_id
		WHERE gm.user_id = ?
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

	var groups []models.Group
	for rows.Next() {
		var group models.Group
		if err := rows.Scan(&group.ID, &group.CreatorID, &group.Title, &group.Description, &group.CreatedAt, &group.UpdatedAt); err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}

func (r* GroupRepository) GetGroupByID(groupID int64) (*models.Group, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, creator_id, title, description, created_at, updated_at
		FROM groups
		WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	var group models.Group
	err = stmt.QueryRow(groupID).Scan(&group.ID, &group.CreatorID, &group.Title, &group.Description, &group.CreatedAt, &group.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &group, nil

}

func (r *GroupRepository) GetMembersByGroupID(groupID int64) ([]models.GroupMember, error) {
	stmt, err := r.db.Prepare(`
		SELECT gm.id, gm.group_id, gm.user_id, gm.accepted, gm.created_at
		FROM group_members gm
		JOIN users u ON gm.user_id = u.id
		WHERE gm.group_id = ?
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

	var members []models.GroupMember
	for rows.Next() {
		var member models.GroupMember
		if err := rows.Scan(&member.ID, &member.GroupID, &member.UserID, &member.Accepted, &member.CreatedAt); err != nil {
			return nil, err
		}
		members = append(members, member)
	}

	return members, nil
}

func (r *GroupRepository) CreateGroupMessage(groupMessage *models.GroupMessage) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO group_messages (group_id, user_id, content, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()
	result, err := stmt.Exec(
		groupMessage.GroupID,
		groupMessage.UserID,
		groupMessage.Content,
		groupMessage.CreatedAt,
		groupMessage.UpdatedAt,
	)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	groupMessage.ID = id
	return id, nil
}

func (r *GroupRepository) GetMessagesByGroupID(groupID int64) ([]models.GroupMessage, error) {
	rows, err := r.db.Query(`
		SELECT id, group_id, user_id, content, created_at, updated_at
		FROM group_messages
		WHERE group_id = ?
		ORDER BY created_at ASC
	`, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.GroupMessage
	for rows.Next() {
		var msg models.GroupMessage
		if err := rows.Scan(&msg.ID, &msg.GroupID, &msg.UserID, &msg.Content, &msg.CreatedAt, &msg.UpdatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}

	return messages, nil
}
