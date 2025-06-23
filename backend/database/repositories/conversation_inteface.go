package repository

import "social-network/backend/database/models"

type ConversationRepositoryInterface interface {
	Create(conversation *models.Conversation) (*models.Conversation, error)
	GetByID(id int64) (*models.Conversation, error)
	GetByName(name string) (*models.Conversation, error)
	UpdatedAt(id int64) (*models.Conversation, error)
	Delete(id int64) error
	GetMembers(conversationID int64) ([]models.ConversationMembers, error)
	Exists(name string) (bool, error)
	CreateOrGetPrivateConversation(userID1, userID2 int64) (*models.Conversation, error)
}