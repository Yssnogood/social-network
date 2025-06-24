package repository

import "social-network/backend/database/models"

type ConversationMemberRepositoryInterface interface {
	AddMember(conversationID, userID int64) error
	GetConversationsByUser(userID int64) ([]int64, error)
	AreUsersInSameConversation(userID1, userID2 int64) (*models.Conversation, error)
}
