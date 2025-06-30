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

