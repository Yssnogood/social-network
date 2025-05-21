package repository

import "social-network/backend/database/models"

type GroupRepositoryInterface interface {
	Create(group *models.Group) (int64, error)
	GetByID(id int64) (*models.Group, error)
	GetByCreatorID(creatorID int64) ([]*models.Group, error)
	update(group *models.Group) error
	Delete(id int64) error
}