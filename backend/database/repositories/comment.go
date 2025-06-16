package repository

import (
	"database/sql"

	"social-network/backend/database/models"
)

// Connection to the database
type CommentRepository struct {
	db *sql.DB
}

// New Constructor for CommentRepository
func NewCommentRepository(db *sql.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

// Create a new comment in the database
func (r *CommentRepository) Create(comment *models.Comment) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO comments(
			post_id, user_id, content, image_path, created_at, updated_at
		) VALUES(?, ?, ?, ?, ?, ?)
	`)

	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		comment.PostID,
		comment.UserID,
		comment.Content,
		comment.ImagePath,
		comment.CreatedAt,
		comment.UpdatedAt,
	)

	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	comment.ID = id
	return id, nil

}

// Get a comment by ID
func (r *CommentRepository) GetByID(id int64) (*models.Comment, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, post_id, user_id, content, image_path, created_at, updated_at
		FROM comments WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	comment := &models.Comment{}
	err = stmt.QueryRow(id).Scan(
		&comment.ID,
		&comment.PostID,
		&comment.UserID,
		&comment.Content,
		&comment.ImagePath,
		&comment.CreatedAt,
		&comment.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return comment, nil
}

// GetComments retrieves the list of comments for a post
func (r *CommentRepository) GetComments(postID int64) ([]*models.Comment, error) {
	rows, err := r.db.Query(`
		SELECT c.id, c.post_id, c.user_id, u.username, c.content, c.image_path, c.created_at, c.updated_at
		FROM comments c
		JOIN users u ON c.user_id = u.id
		WHERE c.post_id = ?
		ORDER BY c.created_at ASC
	`, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []*models.Comment

	for rows.Next() {
		c := &models.Comment{}
		err := rows.Scan(
			&c.ID,
			&c.PostID,
			&c.UserID,
			&c.Username,
			&c.Content,
			&c.ImagePath,
			&c.CreatedAt,
			&c.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		comments = append(comments, c)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
}

// Update a comment in the database
func (r *CommentRepository) Update(comment *models.Comment) error {
	stmt, err := r.db.Prepare(`
		UPDATE comments SET
			content = ?, image_path = ?, updated_at = ?
		WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		comment.Content,
		comment.ImagePath,
		comment.UpdatedAt,
		comment.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

// Delete a comment from the database
func (r *CommentRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM comments WHERE id = ?
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
