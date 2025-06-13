package models

import (
	"time"
)

// User model
type User struct {
	ID           int64     `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	FirstName    string    `json:"first_name"`
	LastName     string    `json:"last_name"`
	BirthDate    time.Time `json:"birth_date"`
	AvatarPath   string    `json:"avatar_path,omitempty"`
	Username     string    `json:"username,omitempty"`
	AboutMe      string    `json:"about_me,omitempty"`
	IsPublic     bool      `json:"is_public"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Post model
type Post struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	Content     string    `json:"content"`
	ImagePath   *string   `json:"image_path,omitempty"`
	PrivacyType int64     `json:"privacy_type"` // 0: public, 1: friend, 2: private
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Comment model
type Comment struct {
	ID        int64     `json:"id"`
	PostID    int64     `json:"post_id"`
	UserID    int64     `json:"user_id"`
	Content   string    `json:"content"`
	ImagePath *string   `json:"image_path"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Username  string    `json:"username"`
}

// Follower model
type Follower struct {
	FollowerID int64     `json:"follower_id"`
	FollowedID int64     `json:"followed_id"`
	Accepted   bool      `json:"accepted"`
	FollowedAt time.Time `json:"followed_at"`
}


// Notification model
type Notification struct {
	ID            int64     `json:"id"`
	UserID        int64     `json:"user_id"`
	Type          string    `json:"type"`
	Content       string    `json:"content"`
	Read          bool      `json:"read"`
	ReferenceID   *int64    `json:"reference_id"`
	ReferenceType *string   `json:"reference_type"`
	CreatedAt     time.Time `json:"created_at"`
}

// Session model
type Session struct {
	ID           int64     `json:"id"`
	UserID       int64     `json:"user_id"`
	SessionToken string    `json:"session_token"`
	CreatedAt    time.Time `json:"created_at"`
	ExpiresAt    time.Time `json:"expires_at"`
}

// --- Conversation models ---

// Conversation model
type Conversation struct {
	ID          int64     `json:"id"`
	Name 	  	string    `json:"name"`
	IsGroup   	bool      `json:"is_group"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ConversationMember model
type ConversationMembers struct {
	ID             int64     `json:"id"`
	ConversationID int64     `json:"conversation_id"`
	UserID         int64     `json:"user_id"`
	JoinedAt       time.Time `json:"joined_at"`
}

// TypingStatus model
type TypingStatus struct {
	ID             int64     `json:"id"`
	ConversationID int64     `json:"conversation_id"`
	UserID         int64     `json:"user_id"`
	LastUpdate     time.Time `json:"last_update"`
}

// Message model
type Message struct {
	ID         		int64      `json:"id"`
	ConversationID 	int64      `json:"conversation_id"`
	SenderID   		int64      `json:"sender_id"`
	ReceiverID 		int64      `json:"receiver_id"`
	GroupID    		*int64     `json:"group_id"`
	Content    		string     `json:"content"`
	CreatedAt  		time.Time  `json:"created_at"`
	ReadAt     		*time.Time `json:"read_at"`
}


// --- Group models ---

// Group model
type Group struct {
	ID          int64     `json:"id"`
	CreatorID   int64     `json:"creator_id"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// GroupPrivacy model
type PostPrivacy struct {
	ID           int64  `json:"id"`
	PostID       int64  `json:"post_id"`
	UserID       int64  `json:"user_id"`
	PrivacyLevel string `json:"privacy_level"` // "public", "followers", "private"
}

// GroupMember model
type GroupMember struct {
	ID        int64     `json:"id"`
	GroupID   int64     `json:"group_id"`
	UserID    int64     `json:"user_id"`
	Accepted  bool      `json:"accepted"`
	CreatedAt time.Time `json:"create_at"`
}

// GroupInvitation model
type GroupInvitation struct {
	ID        int64     `json:"id"`
	GroupID   int64     `json:"group_id"`
	InviterID int64     `json:"inviter_id"`
	InviteeID int64     `json:"invitee_id"`
	Pending   bool      `json:"pending"`
	CreatedAt time.Time `json:"create_at"`
}

// GroupPost model
type GroupPost struct {
	ID        int64     `json:"id"`
	GroupID   int64     `json:"group_id"`
	UserID    int64     `json:"user_id"`
	Content   string    `json:"content"`
	ImagePath *string   `json:"image_path"`
	CreatedAt time.Time `json:"create_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// GroupComment model
type GroupComment struct {
	ID          int64     `json:"id"`
	GroupPostID int64     `json:"group_post_id"`
	UserID      int64     `json:"user_id"`
	Content     string    `json:"content"`
	CreatedAt   time.Time `json:"create_at"`
	UpdatedAt   time.Time `json:"update_at"`
}

// --- Event models ---

// Event model
type Event struct {
	ID          int64     `json:"id"`
	GroupID     int64     `json:"group_id"`
	CreatorID   int64     `json:"creator_id"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	EventDate   time.Time `json:"event_date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// EventOption model
type EventOption struct {
	ID         int64  `json:"id"`
	EventID    int64  `json:"event_id"`
	OptionText string `json:"option_text"`
}

// EventResponse model
type EventResponse struct {
	ID        int64     `json:"id"`
	EventID   int64     `json:"event_id"`
	UserID    int64     `json:"user_id"`
	OptionID  *int64    `json:"option_id"`
	CreatedAt time.Time `json:"create_at"`
}
