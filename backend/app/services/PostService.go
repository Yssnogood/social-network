package services

import (
	"database/sql"
	"social-network/backend/database/models"
)

// UserService is a service for managing users.
type PostService struct {
	db *sql.DB
}

// NewUserService creates a new UserService.
func NewPostService(db *sql.DB) *PostService {
	return &PostService{db: db}
}

func (s *PostService) GetPostAuthor(post *models.Post) (*models.User, error) {
	stmt, err := s.db.Prepare(`
		SELECT id, email, password_hash, first_name, last_name, birth_date,
			avatar_path, username, about_me, is_public, created_at, updated_at
		FROM users WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	user := &models.User{}
	err = stmt.QueryRow(post.UserID).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.BirthDate,
		&user.AvatarPath,
		&user.Username,
		&user.AboutMe,
		&user.IsPublic,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}
