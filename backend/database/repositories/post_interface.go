package repository

import (
	"social-network/backend/app/services"
	"social-network/backend/database/models"
)

type PostRepositoryInterface interface {
	Create(post *models.Post) (int64, error)
	GetByID(id int64) (*models.Post, error)
	GetPosts(*services.PostService) ([]map[string]any, error)
	Update(post *models.Post) error
	Delete(id int64) error
}
