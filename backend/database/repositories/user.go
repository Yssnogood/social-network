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

// update a user in the database
func (r *UserRepository) Update(user *models.User) error {

	// case where the PassWord is not getting change
	if(user.PasswordHash == ""){
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

	}else {
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
