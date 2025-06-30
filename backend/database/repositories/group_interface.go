package repository

import "social-network/backend/database/models"

type GroupRepositoryInterface interface {
	Create(group *models.Group) (int64, error)
}