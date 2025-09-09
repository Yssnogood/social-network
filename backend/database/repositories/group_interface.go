package repository

import (
	"social-network/backend/database/models"
	"time"
)

type GroupRepositoryInterface interface {
	// Core group operations
	Create(group *models.Group) (int64, error)
	GetGroupByID(groupID int64) (*models.Group, error)
	GetGroupsByUserID(userID int64) ([]models.Group, error)

	// Member management
	AddMember(groupID, userID int64, Username string, accepted bool, createdAt time.Time) error
	GetMembersByGroupID(groupID int64) ([]models.GroupMember, error)

	// Invitation management
	CreateGroupInvitation(groupID, inviterID, inviteeID int64) (*models.Group, error)
	DeleteInvitation(userID, groupID int64) error
	GetInvitationByID(invitationID int64) (*models.GroupInvitation, error)
	GetPendingInvitationsByUser(userID int64) ([]models.GroupInvitation, error)
	GetInvitationsByInviter(inviterID int64) ([]models.GroupInvitation, error)
	CheckExistingInvitation(groupID, inviteeID int64) (bool, error)

	// Message management
	CreateGroupMessage(groupMessage *models.GroupMessage) (int64, error)
	GetMessagesByGroupID(groupID int64) ([]models.GroupMessage, error)

	// Post management
	CreateGroupPost(groupPost *models.GroupPost) (int64, error)
	GetPostsByGroupID(groupID int64) ([]models.GroupPost, error)

	// Comment management
	CreateGroupComment(comment *models.GroupComment) (int64, error)
	GetCommentsByPostID(postID int64) ([]models.GroupComment, error)
}
