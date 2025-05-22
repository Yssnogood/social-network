package repository

import "social-network/backend/database/models"

type ConversationMembersRepositoryInterface interface {
	Create(conversationMember *models.ConversationMembers) (*models.ConversationMembers, error)
	GetByID(id int64) (*models.ConversationMembers, error)
	GetByConversationID(conversationID int64) ([]*models.ConversationMembers, error)
	GetByUserID(userID int64) ([]*models.ConversationMembers, error)
	Delete(id int64) error
}