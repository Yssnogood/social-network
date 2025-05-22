package repository

import "social-network/backend/database/models"

type TypingStatusRepositoryInterface interface {
	Create(typingStatus *models.TypingStatus) (*models.TypingStatus, error)
	GetByID(id int64) (*models.TypingStatus, error)
	GetByConversationID(conversationID int64) ([]*models.TypingStatus, error)
	GetByUserID(userID int64) ([]*models.TypingStatus, error)
	update(typingStatus *models.TypingStatus) (*models.TypingStatus, error)
	Delete(id int64) error
}