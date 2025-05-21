package repository

import "social-network/backend/database/models"

type EventRepositoryInterface interface {
	Create(event *models.Event) (int64, error)
	GetByID(id int64) (*models.Event, error)
	GetAllByGroupID(groupID int64) ([]*models.Event, error)
	Update(event *models.Event) error
	Delete(id int64) error
}