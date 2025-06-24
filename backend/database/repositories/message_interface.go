package repository

import (
	"social-network/backend/database/models"
	"time"
)

type MessageRepositoryInterface interface {
	Create(message *models.Message) (int64, error)
	GetByID(id int64) (*models.Message, error)
	GetMessagesBetweenUsers(userID1, userID2 int64) ([]*models.Message, error)
	GetMessagesByConversationID(conversationID int64) ([]*models.Message, error)
	Update(message *models.Message) error
	Delete(id int64) error
	MarkAsRead(messageID int64, readAt time.Time) error
	GetConversationID(messageID int64) (int64, error)
}
