package repository

import (
	"database/sql"

	"social-network/backend/database/models"
)

// Connection to the database
type PostRepository struct {
	db *sql.DB
}

// New Constructor for PostRepository
func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

// Create a new post in the database
func (r *PostRepository) Create(post *models.Post) (int64, error) {
	stmt, err := r.db.Prepare(`
	INSERT INTO posts(
		user_id, content, image_path, privacy_type, created_at, updated_at)
		VALUES(?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		post.UserID,
		post.Content,
		post.ImagePath,
		post.PrivacyType,
		post.CreatedAt,
		post.UpdatedAt,
	)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	post.ID = id
	return id, nil
}

// Get a post by ID
func (r *PostRepository) GetByID(id int64) (*models.Post, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, user_id, content, image_path, privacy_type, created_at, updated_at
		FROM posts WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	post := &models.Post{}
	err = stmt.QueryRow(id).Scan(
		&post.ID,
		&post.UserID,
		&post.Content,
		&post.ImagePath,
		&post.PrivacyType,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return post, nil
}

// update a post in the database
func (r *PostRepository) Update(post *models.Post) error {
	stmt, err := r.db.Prepare(`
		UPDATE posts SET
			content = ?, image_path = ?, privacy_type = ?, updated_at = ?
		WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		post.Content,
		post.ImagePath,
		post.PrivacyType,
		post.UpdatedAt,
		post.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

// Delete a post from the database
func (r *PostRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM posts WHERE id = ?
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