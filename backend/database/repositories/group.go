package repository

import (
	"database/sql"

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

// Get a group by ID
func (r *GroupRepository) GetByID(id int64) (*models.Group, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, creator_id, title, description, created_at, updated_at
		FROM groups WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	group := &models.Group{}
	err = stmt.QueryRow(id).Scan(
		&group.ID,
		&group.CreatorID,
		&group.Title,
		&group.Description,
		&group.CreatedAt,
		&group.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return group, nil
}

// Get all groups created by a user
func (r *GroupRepository) GetByCreatorID(creatorID int64) ([]*models.Group, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, creator_id, title, description, created_at, updated_at
		FROM groups WHERE creator_id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(creatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []*models.Group
	for rows.Next() {
		group := &models.Group{}
		err = rows.Scan(
			&group.ID,
			&group.CreatorID,
			&group.Title,
			&group.Description,
			&group.CreatedAt,
			&group.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}

// update a group in the database
func (r *GroupRepository) Update(group *models.Group) error {
	stmt, err := r.db.Prepare(`
		UPDATE groups SET
			title = ?, description = ?, updated_at = ?
		WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		group.Title,
		group.Description,
		group.UpdatedAt,
		group.ID,
	)
	return err
}

// Delete a group from the database
func (r *GroupRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM groups WHERE id = ?
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