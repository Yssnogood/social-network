package repository

import (
	"database/sql"
	"fmt"
	"slices"
	"time"

	"social-network/backend/app/services"
	"social-network/backend/database/models"
)

// Connection to the database
type PostRepository struct {
	db *sql.DB
}

// New Constructor for PostRepository
func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

// Create a new post in the database
func (r *PostRepository) Create(post *models.Post) (int64, error) {
	stmt, err := r.db.Prepare(`
	INSERT INTO posts(
		user_id, content, image_path, privacy_type, created_at, updated_at)
		VALUES(?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		post.UserID,
		post.Content,
		post.ImagePath,
		post.PrivacyType,
		post.CreatedAt,
		post.UpdatedAt,
	)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	post.ID = id
	return id, nil
}

// Get a post by ID
func (r *PostRepository) GetByID(id int64, ps *services.PostService, curr_user *models.User) (map[string]any, error) {
	stmt, err := r.db.Prepare(`
		SELECT id, user_id, content, image_path, privacy_type, created_at, updated_at
		FROM posts WHERE id = ?
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	post := &models.Post{}
	err = stmt.QueryRow(id).Scan(
		&post.ID,
		&post.UserID,
		&post.Content,
		&post.ImagePath,
		&post.PrivacyType,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	user, err := ps.GetPostAuthor(post)
	if err != nil || user == nil {
		return nil, err
	}
	likes, _ := ps.GetLikes(post.ID)
	return map[string]any{
		"post":  post,
		"user":  user.Username,
		"likes": len(likes),
		"liked": slices.Contains(likes, curr_user.Username),
	}, nil
}

func (r *PostRepository) GetPosts(ps *services.PostService, curr_user *models.User) ([]map[string]any, error) {
	var posts []map[string]any
	stmt, err := r.db.Prepare(`
		SELECT id, user_id, content, image_path, privacy_type, created_at, updated_at
		FROM posts
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	results, err := stmt.Query()
	if err != nil {
		return nil, err
	}

	for results.Next() {
		post := &models.Post{}
		err = results.Scan(
			&post.ID,
			&post.UserID,
			&post.Content,
			&post.ImagePath,
			&post.PrivacyType,
			&post.CreatedAt,
			&post.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		// Get likes and dislikes counts
		likeCount, _ := r.GetLikesCount(post.ID)
		dislikeCount, _ := r.GetDislikesCount(post.ID)
		userReaction, _ := r.GetUserReaction(post.ID, curr_user.ID)
		
		commentCount, err := r.GetNumberOfComments(post.ID)
		if err != nil {
			return nil, err
		}
		post.CommentsCount = commentCount
		user, err := ps.GetPostAuthor(post)
		if err != nil || user == nil {
			// Skip this post if we can't find the author
			continue
		}
		isPrivate := user.ID != curr_user.ID && post.PrivacyType != 0
		if isPrivate {
			switch post.PrivacyType {
			case 1:
				isPrivate = !ps.IsAuthorFriend(user.ID, curr_user.ID)
			case 2:
				isPrivate = !ps.CheckPrivacy(post.ID, curr_user.ID)
			}
		}
		if !isPrivate {
			posts = append(posts, map[string]any{
				"post":         post,
				"user":         user,
				"like":         likeCount,
				"dislike":      dislikeCount,
				"user_liked":   userReaction == "like",
				"user_disliked": userReaction == "dislike",
			})
		}
	}
	return posts, nil
}

func (r *PostRepository) GetNumberOfComments(postID int64) (int64, error) {
	var count int64
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM comments WHERE post_id = ?
	`, postID).Scan(&count)
	if err != nil && err == sql.ErrNoRows {
		return 0, err
	}
	return count, nil
}

// update a post in the database
func (r *PostRepository) Update(post *models.Post) error {
	stmt, err := r.db.Prepare(`
		UPDATE posts SET
			content = ?, image_path = ?, privacy_type = ?, updated_at = ?
		WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		post.Content,
		post.ImagePath,
		post.PrivacyType,
		post.UpdatedAt,
		post.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

// ADD or UPDATE a Like on a post with exclusivity (can't like AND dislike)
func (r *PostRepository) Like(post_id int64, user_id int64) string {
	// Check if user already has a reaction
	var existingReaction string
	err := r.db.QueryRow(`
		SELECT reaction_type 
		FROM post_like
		WHERE post_id = ? AND user_id = ?
	`, post_id, user_id).Scan(&existingReaction)
	
	if err == sql.ErrNoRows {
		// No existing reaction, add a like
		r.AddReaction(post_id, user_id, "like")
		return "liked"
	} else if err != nil {
		return ""
	}
	
	// If existing reaction is like, remove it (toggle off)
	if existingReaction == "like" {
		r.DeleteReaction(post_id, user_id)
		return "unliked"
	}
	
	// If existing reaction is dislike, update to like
	r.UpdateReaction(post_id, user_id, "like")
	return "liked"
}

// ADD or UPDATE a Dislike on a post with exclusivity
func (r *PostRepository) Dislike(post_id int64, user_id int64) string {
	// Check if user already has a reaction
	var existingReaction string
	err := r.db.QueryRow(`
		SELECT reaction_type 
		FROM post_like
		WHERE post_id = ? AND user_id = ?
	`, post_id, user_id).Scan(&existingReaction)
	
	if err == sql.ErrNoRows {
		// No existing reaction, add a dislike
		r.AddReaction(post_id, user_id, "dislike")
		return "disliked"
	} else if err != nil {
		return ""
	}
	
	// If existing reaction is dislike, remove it (toggle off)
	if existingReaction == "dislike" {
		r.DeleteReaction(post_id, user_id)
		return "undisliked"
	}
	
	// If existing reaction is like, update to dislike
	r.UpdateReaction(post_id, user_id, "dislike")
	return "disliked"
}

// Add a reaction (like or dislike) to a post
func (r *PostRepository) AddReaction(post_id int64, user_id int64, reaction_type string) error {
	stmt, err := r.db.Prepare(`
		INSERT INTO post_like (post_id, user_id, reaction_type, created_at)
		VALUES(?, ?, ?, ?)
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()
	
	_, err = stmt.Exec(post_id, user_id, reaction_type, time.Now())
	return err
}

// Update an existing reaction
func (r *PostRepository) UpdateReaction(post_id int64, user_id int64, reaction_type string) error {
	stmt, err := r.db.Prepare(`
		UPDATE post_like 
		SET reaction_type = ?, created_at = ?
		WHERE post_id = ? AND user_id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()
	
	_, err = stmt.Exec(reaction_type, time.Now(), post_id, user_id)
	return err
}

// Delete a reaction from the database
func (r *PostRepository) DeleteReaction(post_id int64, user_id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM post_like WHERE post_id = ? AND user_id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(post_id, user_id)
	return err
}

// Get likes count for a post (only likes, not dislikes)
func (r *PostRepository) GetLikesCount(post_id int64) (int64, error) {
	var count int64
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM post_like 
		WHERE post_id = ? AND reaction_type = 'like'
	`, post_id).Scan(&count)
	
	if err == sql.ErrNoRows {
		return 0, nil
	}
	return count, err
}

// Get dislikes count for a post
func (r *PostRepository) GetDislikesCount(post_id int64) (int64, error) {
	var count int64
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM post_like 
		WHERE post_id = ? AND reaction_type = 'dislike'
	`, post_id).Scan(&count)
	
	if err == sql.ErrNoRows {
		return 0, nil
	}
	return count, err
}

// Get user's reaction on a post (like, dislike, or none)
func (r *PostRepository) GetUserReaction(post_id int64, user_id int64) (string, error) {
	var reaction_type string
	err := r.db.QueryRow(`
		SELECT reaction_type FROM post_like 
		WHERE post_id = ? AND user_id = ?
	`, post_id, user_id).Scan(&reaction_type)
	
	if err == sql.ErrNoRows {
		return "", nil // No reaction
	}
	return reaction_type, err
}

// Delete a post from the database
func (r *PostRepository) Delete(id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM posts WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	if err != nil {
		return err
	}

	return nil
}

func (r *PostRepository) GetPostsFromUserByID(id int64, curr_user int64, ps *services.PostService) ([]*models.Post, error) {
	rows, err := r.db.Query(`
		SELECT id, user_id, content, image_path, privacy_type, created_at, updated_at
		FROM posts WHERE user_id = ?
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []*models.Post
	for rows.Next() {
		post := &models.Post{}
		if err := rows.Scan(
			&post.ID,
			&post.UserID,
			&post.Content,
			&post.ImagePath,
			&post.PrivacyType,
			&post.CreatedAt,
			&post.UpdatedAt,
		); err != nil {
			return nil, err
		}
		isPrivate := post.UserID != curr_user && post.PrivacyType != 0
		if isPrivate {
			switch post.PrivacyType {
			case 1:
				isPrivate = !ps.IsAuthorFriend(post.UserID, curr_user)
			case 2:
				isPrivate = !ps.CheckPrivacy(post.ID, curr_user)
			}
		}
		if !isPrivate {
			posts = append(posts, post)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

func (r *PostRepository) GetLikedPostsByUserId(userID int64) ([]int64, error) {
	query := `
		SELECT post_id 
		FROM post_like 
		WHERE user_id = ? AND reaction_type = 'like'
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var likedPosts []int64

	for rows.Next() {
		var postID int64
		if err := rows.Scan(&postID); err != nil {
			return nil, err
		}
		likedPosts = append(likedPosts, postID)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return likedPosts, nil
}

func (r *PostRepository) GetPostById(postID int64) (*models.Post, error) {
	query := `
		SELECT id, user_id, content, image_path, privacy_type, created_at, updated_at
		FROM posts
		WHERE id = ?
	`

	row := r.db.QueryRow(query, postID)

	post := &models.Post{}

	err := row.Scan(
		&post.ID,
		&post.UserID,
		&post.Content,
		&post.ImagePath,
		&post.PrivacyType,
		&post.CreatedAt,
		&post.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // pas d'erreur mais post non trouvé
		}
		return nil, err // autre erreur (DB, etc.)
	}

	return post, nil
}

// GetLikesCountByPostID retourne le nombre de likes pour un post
func (r *PostRepository) GetLikesCountByPostID(postID int64) (int, error) {
	var count int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM post_like WHERE post_id = ?`, postID).Scan(&count)
	return count, err
}

// GetCommentsCountByPostID retourne le nombre de commentaires pour un post
func (r *PostRepository) GetCommentsCountByPostID(postID int64) (int, error) {
	var count int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM comments WHERE post_id = ?`, postID).Scan(&count)
	return count, err
}

func (r *PostRepository) UpdateViewersPrivacy(post_id int64, incomming []int64, ps *services.PostService) error {
	err := ps.DeletePostCurrentViewers(post_id)
	if err != nil {
		fmt.Println(err)
		return err
	}
	for _, user_id := range incomming {
		stmt, err := r.db.Prepare(`
		INSERT INTO post_privacy (post_id,user_id) 
		VALUES(?,?);
	`)
		if err != nil {
			fmt.Println(err)
			return err
		}

		_, err = stmt.Exec(post_id, user_id)
		if err != nil {
			fmt.Println(err)
			return err
		}
	}
	return nil
}
