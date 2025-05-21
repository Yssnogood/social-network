package repository

import "social-network/backend/database/models"

type NotificationRepositoryInterface interface {
	create(notification *models.Notification) (int64, error)
	getByID(id int64) (*models.Notification, error)
	getAllByUserID(userID int64) ([]*models.Notification, error)
	update(notification *models.Notification) error
	delete(id int64) error
	DeleteAllByUserID(userID int64) error
}