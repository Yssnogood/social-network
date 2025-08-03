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
		likes, _ := ps.GetLikes(post.ID)
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
				"post":       post,
				"user":       user,
				"like":       len(likes),
				"user_liked": slices.Contains(likes, curr_user.Username),
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

// ADD or DELETE a Like on a post
func (r *PostRepository) Like(post_id int64, user_id int64) string {
	stmt, err := r.db.Prepare(`
		SELECT id 
		FROM post_like
		WHERE post_id = ? AND user_id = ?;
	`)
	if err != nil {
		return ""
	}
	var id int64
	err = stmt.QueryRow(post_id, user_id).Scan(&id)
	if err != nil {
		r.AddLike(post_id, user_id)
		return "liked"
	}
	r.DeleteLike(post_id, user_id)
	return "disliked"
}

// Like a Post
func (r *PostRepository) AddLike(post_id int64, user_id int64) {
	stmt, err := r.db.Prepare(`
	INSERT INTO post_like (post_id,user_id,created_at)
	VALUES(?,?,?);
	`)
	if err != nil {
		return
	}
	defer stmt.Close()
	_, err = stmt.Exec(
		post_id,
		user_id,
		time.Now())
	if err != nil {
		fmt.Println(err)
		r.DeleteLike(post_id, user_id)
		return
	}
}

// Delete a post like from the database
func (r *PostRepository) DeleteLike(post_id int64, user_id int64) error {
	stmt, err := r.db.Prepare(`
		DELETE FROM post_like WHERE post_id = ? AND user_id = ?;
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(post_id, user_id)
	if err != nil {
		return err
	}

	return nil
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
		WHERE user_id = ?
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
