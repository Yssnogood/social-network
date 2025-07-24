package repository

import (
	"database/sql"
	"fmt"
	"time"

	"social-network/backend/database/models"
)

// Connection to the database
type GroupRepository struct {
	db *sql.DB
}

// New Constructor for GroupRepository
func NewGroupRepository(db *sql.DB) *GroupRepository {
	return &GroupRepository{db: db}
}

// Create a new group in the database
func (r *GroupRepository) Create(group *models.Group) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO groups(
			creator_id, creator_name, title, description, created_at, updated_at
		) VALUES(?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		group.CreatorID,
		group.CreatorName,
		group.Title,
		group.Description,
		group.CreatedAt,
		group.UpdatedAt,
	)

	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	group.ID = id
	return id, nil
}

func (r *GroupRepository) AddMember(groupID, userID int64, Username string, accepted bool, createdAt time.Time) error {
	stmt, err := r.db.Prepare(`
		INSERT INTO group_members (group_id, user_id, username, accepted, created_at)
		VALUES (?, ?, ?, ?, ?)
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(groupID, userID, Username, accepted, createdAt)
	return err
}

func (r *GroupRepository) CreateGroupInvitation(groupID, inviterID, inviteeID int64) (*models.Group, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO group_invitations (group_id, inviter_id, invitee_id, create_at)
		VALUES (?, ?, ?, ?)
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	createdAt := time.Now()
	result, err := stmt.Exec(groupID, inviterID, inviteeID, createdAt)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	group := &models.Group{
		ID:        id,
		CreatorID: inviterID,
	}
	return group, nil
}

func (r *GroupRepository) DeleteInvitation(userID, groupID int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM group_invitations
		WHERE invitee_id = ? AND group_id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(userID, groupID)
	return err
}

func (r *GroupRepository) GetGroupsByUserID(userID int64) ([]models.Group, error) {
	stmt, err := r.db.Prepare(`
		SELECT g.id, g.creator_id, g.creator_name, g.title, g.description, g.created_at, g.updated_at
		FROM groups g
		JOIN group_members gm ON g.id = gm.group_id
		WHERE gm.user_id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []models.Group
	for rows.Next() {
		var group models.Group
		if err := rows.Scan(&group.ID, &group.CreatorID, &group.CreatorName ,&group.Title, &group.Description, &group.CreatedAt, &group.UpdatedAt); err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}

func (r* GroupRepository) GetGroupByID(groupID int64) (*models.Group, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, creator_id, creator_name, title, description, created_at, updated_at
		FROM groups
		WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	var group models.Group
	err = stmt.QueryRow(groupID).Scan(&group.ID, &group.CreatorID, &group.CreatorName, &group.Title, &group.Description, &group.CreatedAt, &group.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &group, nil

}

func (r *GroupRepository) GetMembersByGroupID(groupID int64) ([]models.GroupMember, error) {
	stmt, err := r.db.Prepare(`
		SELECT gm.id, gm.group_id, gm.user_id, gm.username, gm.accepted, gm.created_at
		FROM group_members gm
		JOIN users u ON gm.user_id = u.id
		WHERE gm.group_id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []models.GroupMember
	for rows.Next() {
		var member models.GroupMember
		if err := rows.Scan(&member.ID, &member.GroupID, &member.UserID, &member.Username, &member.Accepted, &member.CreatedAt); err != nil {
			return nil, err
		}
		members = append(members, member)
	}

	return members, nil
}

func (r *GroupRepository) CreateGroupMessage(groupMessage *models.GroupMessage) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO group_messages (group_id, user_id, username, content, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()
	result, err := stmt.Exec(
		groupMessage.GroupID,
		groupMessage.UserID,
		groupMessage.Username,
		groupMessage.Content,
		groupMessage.CreatedAt,
		groupMessage.UpdatedAt,
	)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	groupMessage.ID = id
	return id, nil
}

func (r *GroupRepository) GetMessagesByGroupID(groupID int64) ([]models.GroupMessage, error) {
	rows, err := r.db.Query(`
		SELECT id, group_id, user_id, username, content, created_at, updated_at
		FROM group_messages
		WHERE group_id = ?
		ORDER BY created_at ASC
	`, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.GroupMessage
	for rows.Next() {
		var msg models.GroupMessage
		if err := rows.Scan(&msg.ID, &msg.GroupID, &msg.UserID, &msg.Username , &msg.Content, &msg.CreatedAt, &msg.UpdatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}

	return messages, nil
}

func (r *GroupRepository) CreateGroupPost(groupPost *models.GroupPost) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO group_posts (group_id, user_id, username, content, image_path, created_at, updated_at, comments_count)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		groupPost.GroupID,
		groupPost.UserID,
		groupPost.Username,
		groupPost.Content,
		groupPost.ImagePath,
		groupPost.CreatedAt,
		groupPost.UpdatedAt,
		groupPost.CommentsCount,
	)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	groupPost.ID = id
	return id, nil
}

func (r *GroupRepository) GetPostsByGroupID(groupID int64) ([]models.GroupPost, error) {
	stmt, err := r.db.Prepare(`
		SELECT gp.id, gp.group_id, gp.user_id, gp.username, gp.content, gp.image_path, gp.created_at, gp.updated_at, gp.comments_count
		FROM group_posts gp
		JOIN users u ON gp.user_id = u.id
		WHERE gp.group_id = ?
		ORDER BY gp.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.GroupPost
	for rows.Next() {
		var post models.GroupPost
		if err := rows.Scan(&post.ID, &post.GroupID, &post.UserID, &post.Username, &post.Content, &post.ImagePath, &post.CreatedAt, &post.UpdatedAt, &post.CommentsCount); err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}

func (r *GroupRepository) CreateGroupComment(comment *models.GroupComment) (int64, error) {
	stmt, err := r.db.Prepare(`
		INSERT INTO group_comments (group_post_id, user_id, username, content, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		comment.GroupPostID,
		comment.UserID,
		comment.Username,
		comment.Content,
		comment.CreatedAt,
		comment.UpdatedAt,
	)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	comment.ID = id

	_, err = r.db.Exec(`
		UPDATE group_posts
		SET comments_count = comments_count + 1
		WHERE id = ?
	`, comment.GroupPostID)
	if err != nil {
		return id, fmt.Errorf("failed to update comments_count: %w", err)
	}

	return id, nil
}

func (r *GroupRepository) GetCommentsByPostID(postID int64) ([]models.GroupComment, error) {
	stmt, err := r.db.Prepare(`
		SELECT gc.id, gc.group_post_id, gc.user_id, gc.username, gc.content, gc.created_at, gc.updated_at
		FROM group_comments gc
		JOIN users u ON gc.user_id = u.id
		WHERE gc.group_post_id = ?
		ORDER BY gc.created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []models.GroupComment
	for rows.Next() {
		var comment models.GroupComment
		if err := rows.Scan(&comment.ID, &comment.GroupPostID, &comment.UserID, &comment.Username, &comment.Content, &comment.CreatedAt, &comment.UpdatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}