package repository

import "social-network/backend/database/models"

type NotificationRepositoryInterface interface {
	Create(notification *models.Notification) (int64, error)
	GetByID(id int64) (*models.Notification, error)
	GetAllByUserID(userID int64) ([]*models.Notification, error)
	Update(notification *models.Notification) error
	Delete(id int64) error
	DeleteAllByUserID(userID int64) error
}
