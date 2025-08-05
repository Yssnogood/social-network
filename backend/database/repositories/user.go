package repository

import (
	"database/sql"

	"social-network/backend/database/models"
)

// Connection to the database
type UserRepository struct {
	db *sql.DB
}

// New Constructor for UserRepository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

type SearchResult struct {
	Type        string  `json:"type"`
	ID          int     `json:"id"`
	Username    *string `json:"username,omitempty"`
	AvatarPath  *string `json:"avatar,omitempty"`
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`
	IsFollowing *bool   `json:"is_following,omitempty"`
	IsFollowedBy *bool   `json:"is_followed_by,omitempty"`
	IsMember    *bool   `json:"is_member,omitempty"`
	IsFriend    *bool   `json:"is_friend,omitempty"`
}

type SearchGroupedResult struct {
	Users  []SearchResult `json:"users"`
	Groups []SearchResult `json:"groups"`
}

// Create a new user in the database
func (r *UserRepository) Create(user *models.User) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO users(
			email, password_hash, first_name, last_name, birth_date,
			avatar_path, username, about_me, is_public, created_at, updated_at
		) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		user.Email,
		user.PasswordHash,
		user.FirstName,
		user.LastName,
		user.BirthDate,
		user.AvatarPath,
		user.Username,
		user.AboutMe,
		user.IsPublic,
		user.CreatedAt,
		user.UpdatedAt,
	)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	user.ID = id
	return id, nil
}

// Get a user by ID
func (r *UserRepository) GetByID(id int64) (*models.User, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, email, password_hash, first_name, last_name, birth_date,
			avatar_path, username, about_me, is_public, created_at, updated_at
		FROM users WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	user := &models.User{}
	err = stmt.QueryRow(id).Scan(
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

// Get a user by ID
func (r *UserRepository) GetByUserName(username string) (*models.User, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, email, password_hash, first_name, last_name, birth_date,
			avatar_path, username, about_me, is_public, created_at, updated_at
		FROM users WHERE username = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	user := &models.User{}
	err = stmt.QueryRow(username).Scan(
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

// Get a user by email
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, email, password_hash, first_name, last_name, birth_date,
			avatar_path, username, about_me, is_public, created_at, updated_at
		FROM users WHERE email = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	user := &models.User{}
	err = stmt.QueryRow(email).Scan(
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

func (r *UserRepository) GetFriendsByUserID(userID int64) ([]*models.User, error) {
	stmt, err := r.db.Prepare(`
		SELECT u.id, u.username, COALESCE(u.avatar_path, '/defaultPP.webp') as avatar_path
		FROM users u
		INNER JOIN followers f1 ON f1.followed_id = u.id AND f1.follower_id = ? AND f1.accepted = TRUE
		INNER JOIN followers f2 ON f2.follower_id = u.id AND f2.followed_id = ? AND f2.accepted = TRUE
		ORDER BY u.username
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	rows, err := stmt.Query(userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.ID, &user.Username, &user.AvatarPath)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func (r *UserRepository) GetUsersForContact(currentUserID int64, query string) ([]*models.User, error) {
	stmt, err := r.db.Prepare(`
		SELECT u.id, u.username, u.avatar_path
		FROM users u
		INNER JOIN followers f1 ON f1.followed_id = u.id AND f1.follower_id = ? AND f1.accepted = TRUE
		INNER JOIN followers f2 ON f2.follower_id = u.id AND f2.followed_id = ? AND f2.accepted = TRUE
		WHERE LOWER(u.username) LIKE LOWER(?)
		ORDER BY u.username
		LIMIT 5
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	likeQuery := "%" + query + "%"
	rows, err := stmt.Query(currentUserID, currentUserID, likeQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.ID, &user.Username, &user.AvatarPath)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// GetFollowingByUserID retrieves the list of users that the current user is following
func (r *UserRepository) GetFollowingByUserID(userID int64) ([]*models.User, error) {
	stmt, err := r.db.Prepare(`
		SELECT u.id, u.username, COALESCE(u.avatar_path, '/defaultPP.webp') as avatar_path
		FROM users u
		INNER JOIN followers f ON f.followed_id = u.id
		WHERE f.follower_id = ? AND f.accepted = TRUE
		ORDER BY u.username
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

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.ID, &user.Username, &user.AvatarPath)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// GetAllUsersWithStatus retrieves all users with their follow status relative to current user
func (r *UserRepository) GetAllUsersWithStatus(currentUserID int64) ([]SearchResult, error) {
	stmt, err := r.db.Prepare(`
		SELECT u.id, u.username, COALESCE(u.avatar_path, '/defaultPP.webp') as avatar_path,
		EXISTS (
			SELECT 1 FROM followers f
			WHERE f.follower_id = ? AND f.followed_id = u.id AND f.accepted = 1
		) AS is_following,
		EXISTS (
			SELECT 1 FROM followers f2
			WHERE f2.follower_id = u.id AND f2.followed_id = ? AND f2.accepted = 1
		) AS is_followed_by,
		EXISTS (
			SELECT 1 FROM followers f1
			JOIN followers f2 ON f1.follower_id = f2.followed_id AND f1.followed_id = f2.follower_id
			WHERE f1.follower_id = ? AND f1.followed_id = u.id AND f1.accepted = 1 AND f2.accepted = 1
		) AS is_friend
		FROM users u
		WHERE u.id != ?
		ORDER BY u.username
		LIMIT 50
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(currentUserID, currentUserID, currentUserID, currentUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []SearchResult
	for rows.Next() {
		var res SearchResult
		res.Type = "user"
		var username, avatar *string
		var isFollowing, isFollowedBy, isFriend bool

		if err := rows.Scan(&res.ID, &username, &avatar, &isFollowing, &isFollowedBy, &isFriend); err != nil {
			return nil, err
		}

		res.Username = username
		res.AvatarPath = avatar
		res.IsFollowing = &isFollowing
		res.IsFollowedBy = &isFollowedBy
		res.IsFriend = &isFriend
		users = append(users, res)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// update a user in the database
func (r *UserRepository) Update(user *models.User) error {

	// case where the PassWord is not getting change
	if user.PasswordHash == "" {
		stmt, err := r.db.Prepare(`
		UPDATE users SET
			email = ?, first_name = ?, last_name = ?,
			birth_date = ?, avatar_path = ?, username = ?, about_me = ?,
			is_public = ?, updated_at = ?
		WHERE id = ?
	`)
		if err != nil {
			return err
		}

		defer stmt.Close()

		_, err = stmt.Exec(
			user.Email,
			user.FirstName,
			user.LastName,
			user.BirthDate,
			user.AvatarPath,
			user.Username,
			user.AboutMe,
			user.IsPublic,
			user.UpdatedAt,
			user.ID,
		)
		if err != nil {
			return err
		}

		return nil

	} else {
		//Case the password is getting changed
		stmt, err := r.db.Prepare(`
			UPDATE users SET
				email = ?, password_hash = ?, first_name = ?, last_name = ?,
				birth_date = ?, avatar_path = ?, username = ?, about_me = ?,
				is_public = ?, updated_at = ?
			WHERE id = ?
		`)
		if err != nil {
			return err
		}

		defer stmt.Close()

		_, err = stmt.Exec(
			user.Email,
			user.PasswordHash,
			user.FirstName,
			user.LastName,
			user.BirthDate,
			user.AvatarPath,
			user.Username,
			user.AboutMe,
			user.IsPublic,
			user.UpdatedAt,
			user.ID,
		)
		if err != nil {
			return err
		}

		return nil
	}

}

// Delete a user from the database
func (r *UserRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM users WHERE id = ?
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

func (r *UserRepository) SearchInstance(query string, currentUserId int) ([]SearchResult, []SearchResult, error) {
	var users []SearchResult
	var groups []SearchResult

	escapedQuery := "%" + query + "%"

	// Rechercher les utilisateurs + les statuts is_following + is_followed_by
	userStmt, err := r.db.Prepare(`
		SELECT u.id, u.username, u.avatar_path,
		EXISTS (
			SELECT 1 FROM followers f
			WHERE f.follower_id = ? AND f.followed_id = u.id AND f.accepted = 1
		) AS is_following,
		EXISTS (
			SELECT 1 FROM followers f2
			WHERE f2.follower_id = u.id AND f2.followed_id = ? AND f2.accepted = 1
		) AS is_followed_by
		FROM users u
		WHERE u.id != ? AND (
			u.username LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?
		)
		LIMIT 10
	`)
	if err != nil {
		return nil, nil, err
	}
	defer userStmt.Close()

	userRows, err := userStmt.Query(currentUserId, currentUserId, currentUserId, escapedQuery, escapedQuery, escapedQuery)
	if err != nil {
		return nil, nil, err
	}
	defer userRows.Close()

	for userRows.Next() {
		var res SearchResult
		res.Type = "user"
		var username, avatar *string
		var isFollowing, isFollowedBy bool

		if err := userRows.Scan(&res.ID, &username, &avatar, &isFollowing, &isFollowedBy); err != nil {
			return nil, nil, err
		}

		res.Username = username
		res.AvatarPath = avatar
		res.IsFollowing = &isFollowing
		res.IsFollowedBy = &isFollowedBy
		users = append(users, res)
	}

	// Rechercher les groupes + le statut is_member
	groupStmt, err := r.db.Prepare(`
		SELECT g.id, g.title, g.description,
		EXISTS (
			SELECT 1 FROM group_members gm
			WHERE gm.group_id = g.id AND gm.user_id = ? AND gm.accepted = 1
		) AS is_member
		FROM groups g
		WHERE g.title LIKE ?
		LIMIT 10
	`)
	if err != nil {
		return nil, nil, err
	}
	defer groupStmt.Close()

	groupRows, err := groupStmt.Query(currentUserId, escapedQuery)
	if err != nil {
		return nil, nil, err
	}
	defer groupRows.Close()

	for groupRows.Next() {
		var res SearchResult
		res.Type = "group"
		var title, description *string
		var isMember bool

		if err := groupRows.Scan(&res.ID, &title, &description, &isMember); err != nil {
			return nil, nil, err
		}

		res.Title = title
		res.Description = description
		res.IsMember = &isMember
		groups = append(groups, res)
	}

	return users, groups, nil
}
