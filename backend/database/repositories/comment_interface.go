package repository

import "social-network/backend/database/models"

type CommentRepositoryInterface interface {
	Create(post *models.Post) (int64, error)
	GetByID(id int64) (*models.Post, error)
	GetComments(postID int64) ([]*models.Comment, error)
	GetCommentsFromUserByID(userId int64) ([]*models.Comment, error)
	Update(post *models.Post) error
	Delete(id int64) error
}
