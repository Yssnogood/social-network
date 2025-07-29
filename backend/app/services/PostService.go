package services

import (
	"database/sql"
	"fmt"
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

func (s *PostService) CheckPrivacy(post_id int64, user_id int64) bool {
	stmt, err := s.db.Prepare(`
	SELECT id FROM post_privacy WHERE post_id = ? AND user_id = ?;
	`)
	if err != nil {
		fmt.Println(err)
		return false
	}
	if err = stmt.QueryRow(post_id, user_id).Scan(); err != nil {
		fmt.Println(err)
		return false
	}
	return true
}

func (s *PostService) IsAuthorFriend(author_id int64, user_id int64) bool {
	stmt, err := s.db.Prepare(`
		SELECT count(f1.follower_id) FROM followers
		INNER JOIN followers f2 ON f2.follower_id = ? AND f2.followed_id = ? AND f2.accepted = TRUE
		WHERE f1.followed_id = ? AND f1.follower_id = ? AND f1.accepted = TRUE;
	`)
	if err != nil {
		fmt.Println(err)
		return false
	}
	var count int
	if err = stmt.QueryRow(author_id, user_id, author_id, user_id).Scan(&count); err != nil {
		fmt.Println(count, err)
		return false
	}
	return true
}
