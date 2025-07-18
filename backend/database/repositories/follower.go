package repository

import (
	"database/sql"

	"social-network/backend/database/models"
)

// Connection to the database
type FollowerRepository struct {
	db *sql.DB
}

// New Constructor for FollowerRepository
func NewFollowerRepository(db *sql.DB) *FollowerRepository {
	return &FollowerRepository{db: db}
}

// Create a new follower in the database
func (r *FollowerRepository) Create(follower *models.Follower) error {
	stmt, err := r.db.Prepare(`
		INSERT INTO followers (
			follower_id, followed_id, accepted, followed_at
		) VALUES (?, ?, ?, ?)
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		follower.FollowerID,
		follower.FollowedID,
		follower.Accepted,
		follower.FollowedAt,
	)
	return err
}

// GetFollowers retrieves the list of followers for a user
func (r *FollowerRepository) GetFollowers(userID int64) ([]*models.Follower, error) {
	rows, err := r.db.Query(`
		SELECT follower_id, followed_id, accepted, followed_at
		FROM followers
		WHERE followed_id = ? AND accepted = 1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followers []*models.Follower

	for rows.Next() {
		f := &models.Follower{}
		err := rows.Scan(
			&f.FollowerID,
			&f.FollowedID,
			&f.Accepted,
			&f.FollowedAt,
		)
		if err != nil {
			return nil, err
		}
		followers = append(followers, f)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return followers, nil
}

// Accept a follower request
func (r *FollowerRepository) Accept(followerID, followedID int64) error {
	stmt, err := r.db.Prepare(`
		UPDATE followers SET accepted = 1 WHERE follower_id = ? AND followed_id = ? AND accepted = 1
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(followerID, followedID)
	return err
}

// Delete a follower from the database
func (r *FollowerRepository) Delete(followerID, followedID int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM followers WHERE follower_id = ? AND followed_id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(followerID, followedID)
	return err
}

// Vérifie si un utilisateur suit déjà une autre personne
func (r *FollowerRepository) IsFollowing(followerID, followedID int64) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS(
			SELECT 1 FROM followers
			WHERE follower_id = ? AND followed_id = ?
		)
	`
	err := r.db.QueryRow(query, followerID, followedID).Scan(&exists)
	return exists, err
}


type FollowerInfo struct {
	ID        int64  // User ID
	Username string
	Avatar_path string
}

func (r *FollowerRepository) GetFollowerUsers(userID int64) ([]*FollowerInfo, error) {
	rows, err := r.db.Query(`
		SELECT u.id, u.username, u.avatar_path
		FROM followers f
		JOIN users u ON f.follower_id = u.id
		WHERE f.followed_id = ? AND f.accepted = 1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followerUsers []*FollowerInfo

	for rows.Next() {
		f := &FollowerInfo{}
		err := rows.Scan(&f.ID, &f.Username, &f.Avatar_path)
		if err != nil {
			return nil, err
		}
		followerUsers = append(followerUsers, f)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}


	return followerUsers, nil
}
