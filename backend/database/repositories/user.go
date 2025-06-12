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

// update a user in the database
func (r *UserRepository) Update(user *models.User) error {
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
