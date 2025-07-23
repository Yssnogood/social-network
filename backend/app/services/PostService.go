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
		SELECT id,avatar_path, username, about_me, is_public, created_at
		FROM users WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	user := &models.User{}
	err = stmt.QueryRow(post.UserID).Scan(
		&user.ID,
		&user.AvatarPath,
		&user.Username,
		&user.AboutMe,
		&user.IsPublic,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *PostService) GetLikes(post_id int64) ([]string, error) {
	var likes []string
	stmt, err := s.db.Prepare(`
	SELECT users.username 
	FROM users
	INNER JOIN post_like ON users.ID = post_like.user_id
	WHERE post_like.post_id = ?
	`)
	if err != nil {
		return nil, err
	}
	result, err := stmt.Query(post_id)
	if err != nil {
		return nil, err
	}
	for result.Next() {
		var username string
		if err = result.Scan(&username); err != nil {
			return nil, err
		}
		likes = append(likes, username)
	}
	return likes, nil
}
