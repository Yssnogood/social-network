package repository

import (
	"database/sql"

	"social-network/backend/database/models"
)

// Connection to the database
type SessionRepository struct {
	db *sql.DB
}

// New Constructor for SessionRepository
func NewSessionRepository(db *sql.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

// Create a new session in the database
func (r *SessionRepository) Create(session *models.Session) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO sessions(
			user_id, session_token, created_at, expires_at
		) VALUES(?, ?, ?, ?)
	`)

	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		session.UserID,
		session.SessionToken,
		session.CreatedAt,
		session.ExpiresAt,
	)

	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	session.ID = id
	return id, nil
}

// Get a session by ID
func (r *SessionRepository) GetByID(id int64) (*models.Session, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, user_id, session_token, created_at, expires_at
		FROM sessions WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	session := &models.Session{}
	err = stmt.QueryRow(id).Scan(
		&session.ID,
		&session.UserID,
		&session.SessionToken,
		&session.CreatedAt,
		&session.ExpiresAt,
	)
	if err != nil {
		return nil, err
	}

	return session, nil
}

// update a session in the database
func (r *SessionRepository) Update(session *models.Session) error {
	stmt, err := r.db.Prepare(`
		UPDATE sessions SET
			user_id = ?, session_token = ?, expires_at = ?
		WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		session.UserID,
		session.SessionToken,
		session.ExpiresAt,
		session.ID,
	)
	return err
}

// Delete a session from the database
func (r *SessionRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM sessions WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	return err
}