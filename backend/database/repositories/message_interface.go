package repository

import "social-network/backend/database/models"

type MessageRepositoryInterface interface {
	Create(message *models.Message) (int64, error)
	GetByID(id int64) (*models.Message, error)
	GetMessagesBetweenUsers(userID1, userID2 int64) ([]*models.Message, error)
	update(message *models.Message) error
	Delete(id int64) error
}