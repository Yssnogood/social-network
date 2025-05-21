package repository

import "social-network/backend/database/models"

type UserRepositoryInterface interface {
	Create(user *models.User) (int64, error)
	GetByID(id int64) (*models.User, error)
	GetByEmail(email string) (*models.User, error)
	Update(user *models.User) error
	Delete(id int64) error
}
