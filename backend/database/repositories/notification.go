package repository

import (
	"database/sql"

	"social-network/backend/database/models"
)

// Connection to the database
type NotificationRepository struct {
	db *sql.DB
}

// New Constructor for NotificationRepository
func NewNotificationRepository(db *sql.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

// Create a new notification in the database
func (r *NotificationRepository) Create(notification *models.Notification) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO notifications(
			user_id, type, content, read, reference_id, reference_type
		) VALUES (?, ?, ?, ?, ?, ?)
`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		notification.UserID,
		notification.Type,
		notification.Content,
		notification.Read,
		notification.ReferenceID,
		notification.ReferenceType,
	)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	notification.ID = id
	return id, nil
}

// Get a notification by ID
func (r *NotificationRepository) GetByID(id int64) (*models.Notification, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, user_id, type, content, read, reference_id, reference_type, created_at
		FROM notifications WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	notification := &models.Notification{}
	err = stmt.QueryRow(id).Scan(
		&notification.ID,
		&notification.UserID,
		&notification.Type,
		&notification.Content,
		&notification.Read,
		&notification.ReferenceID,
		&notification.ReferenceType,
		&notification.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return notification, nil
}

// Get all notifications for a user
func (r *NotificationRepository) GetAllByUserID(userID int64) ([]*models.Notification, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, user_id, type, content, read, reference_id, reference_type, created_at
		FROM notifications WHERE user_id = ?
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

	var notifications []*models.Notification
	for rows.Next() {
		notification := &models.Notification{}
		err = rows.Scan(
			&notification.ID,
			&notification.UserID,
			&notification.Type,
			&notification.Content,
			&notification.Read,
			&notification.ReferenceID,
			&notification.ReferenceType,
			&notification.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}

	return notifications, nil
}

// Update a notification in the database
func (r *NotificationRepository) Update(notification *models.Notification) error {
	stmt, err := r.db.Prepare(`
		UPDATE notifications SET
			user_id = ?, type = ?, content = ?, read = ?, reference_id = ?, reference_type = ?
		WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(
		notification.UserID,
		notification.Type,
		notification.Content,
		notification.Read,
		notification.ReferenceID,
		notification.ReferenceType,
		notification.ID,
	)
	if err != nil {
		return err
	}
	return nil
}

// Delete a notification from the database
func (r *NotificationRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM notifications WHERE id = ?
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

// Delete a notification for a user by user ID
func (r *NotificationRepository) DeleteByUserID(userID int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM notifications WHERE user_id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(userID)
	if err != nil {
		return err
	}

	return nil
}

// Delete all notifications for a user
func (r *NotificationRepository) DeleteAllByUserID(userID int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM notifications WHERE user_id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(userID)
	if err != nil {
		return err
	}

	return nil
}

func (r *NotificationRepository) DeleteFollowRequestFromUser(userID, requesterID int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM notifications WHERE user_id = ? AND reference_id = ? AND type = 'follow_request'
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(userID, requesterID)
	if err != nil {
		return err
	}

	return nil
}

func (r *NotificationRepository) DeleteGroupInvitationRequest(userID, groupID int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM notifications WHERE user_id = ? AND reference_id = ? AND type = 'group_invitation'
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(userID, groupID)
	if err != nil {
		return err
	}

	return nil
}

func (r *NotificationRepository) CreateNotification(
	userID int64,
	notifType string,
	content string,
	referenceID *int64,
	referenceType *string,
) (int64, error) {
	notification := &models.Notification{
		UserID:        userID,
		Type:          notifType,
		Content:       content,
		Read:          false,
		ReferenceID:   referenceID,
		ReferenceType: referenceType,
	}
	return r.Create(notification)
}

// Check if a group invitation notification exists for a user and group
func (r *NotificationRepository) HasPendingGroupInvitation(userID, groupID int64) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS(
			SELECT 1 FROM notifications
			WHERE user_id = ? AND reference_id = ? AND type = 'group_invitation'
		)
	`
	err := r.db.QueryRow(query, userID, groupID).Scan(&exists)
	return exists, err
}
