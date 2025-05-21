package repository

import "social-network/backend/database/models"

type SessionRepositoryInterface interface {
	Create(session *models.Session) (int64, error)
	GetByID(id int64) (*models.Session, error)
	Update(session *models.Session) error
	Delete(id int64) error
}