package repository

import "social-network/backend/database/models"

type FollowerRepositoryInterface interface {
	Create(follower *models.Follower) error
	GetFollowers(id int64) ([]*models.Follower, error)
	Accept(followerID, followedID int64) error
	Delete(followerID, FollowedID int64) error
}