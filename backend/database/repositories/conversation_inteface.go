package repository

import "social-network/backend/database/models"

type ConversationRepositoryInterface interface {
	Create(conversation *models.Conversation) (*models.Conversation, error)
	GetByID(id int64) (*models.Conversation, error)
	GetByName(name string) (*models.Conversation, error)
	UpdatedAt(id int64) (*models.Conversation, error)
	Delete(id int64) error
}