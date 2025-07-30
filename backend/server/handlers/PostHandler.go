package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"social-network/backend/app/services"
	"social-network/backend/database/models"
	repository "social-network/backend/database/repositories"
	"social-network/backend/server/middlewares"
)

type PostHandler struct {
	PostService       *services.PostService
	PostRepository    *repository.PostRepository
	SessionRepository *repository.SessionRepository
	UserRepository    *repository.UserRepository
}

func NewPostHandler(ps *services.PostService, pr *repository.PostRepository, sr *repository.SessionRepository, ur *repository.UserRepository) *PostHandler {
	return &PostHandler{
		PostService:       ps,
		PostRepository:    pr,
		SessionRepository: sr,
		UserRepository:    ur,
	}
}

type CreatePostRequest struct {
	JWT         string  `json:"jwt"`
	Content     string  `json:"content"`
	ImagePath   *string `json:"image_path,omitempty"`
	Viewers     []int64 `json:"viewers"`
	PrivacyType int64   `json:"privacy_type"`
}

type LikePostRequest struct {
	JWT     string `json:"jwt"`
	Post_ID int64  `json:"post_id"`
}

func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	session, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	now := time.Now()
	post := &models.Post{
		UserID:      session.UserID,
		Content:     req.Content,
		ImagePath:   req.ImagePath,
		PrivacyType: req.PrivacyType,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	user, _ := h.PostService.GetPostAuthor(post)

	id, err := h.PostRepository.Create(post)
	if err != nil {
		http.Error(w, "Error creating post", http.StatusInternalServerError)
		return
	}

	err = h.PostRepository.UpdateViewersPrivacy(id, req.Viewers, h.PostService)
	if err != nil {
		http.Error(w, "Error Updating Viewers Privacy", http.StatusInternalServerError)
	}

	post.ID = id
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"post":     post,
		"username": user.Username,
	})
}

// GetPostRequest is the request body for retrieving a post by ID.
type GetPostRequest struct {
	JWT string `json:"jwt"`
}

type GetPostRequestFromUserByID struct {
	ID int64 `json:"user_id"`
}

type PostResponse struct {
	Post          *models.Post `json:"post"`
	User          string       `json:"user"`
	Like          int          `json:"like"`
	UserLiked     bool         `json:"user_liked"`
	CommentsCount int          `json:"comments_count"`
}

// GetPost retrieves a post by ID from JSON body.
func (h *PostHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req GetPostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	session, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	user := h.SessionRepository.GetUserBySession(session)

	// Extract ID from URL path, assuming /post/{id}
	parts := strings.Split(r.URL.Path, "/")
	postID, err := strconv.Atoi(parts[3])
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}
	post, err := h.PostRepository.GetByID(int64(postID), h.PostService, user)
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(post)
}

func (h *PostHandler) LikePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req LikePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	session, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	h.PostRepository.Like(req.Post_ID, session.UserID)
}

// GetRecentsPosts retrieves recents posts.
func (h *PostHandler) GetRecentsPosts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req GetPostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	session, err := h.SessionRepository.GetBySessionToken(req.JWT)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user := h.SessionRepository.GetUserBySession(session)

	posts, err := h.PostRepository.GetPosts(h.PostService, user)
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(posts)
}

// UpdatePostRequest is the request body for updating a post.
type UpdatePostRequest struct {
	ID          int64   `json:"id"`
	Content     string  `json:"content"`
	ImagePath   *string `json:"image_path,omitempty"`
	PrivacyType int64   `json:"privacy_type"`
}

// UpdatePost updates a post by ID from JSON body.
// func (h *PostHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
// 	var req UpdatePostRequest
// 	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
// 		http.Error(w, "Invalid request body", http.StatusBadRequest)
// 		return
// 	}

// 	post, err := h.PostRepository.GetByID(req.ID, h.PostService)
// 	if err != nil {
// 		http.Error(w, "Post not found", http.StatusNotFound)
// 		return
// 	}

// 	post.Content = req.Content
// 	post.ImagePath = req.ImagePath
// 	post.PrivacyType = req.PrivacyType
// 	post.UpdatedAt = time.Now()

// 	if err := h.PostRepository.Update(post); err != nil {
// 		http.Error(w, "Failed to update post", http.StatusInternalServerError)
// 		return
// 	}

// 	json.NewEncoder(w).Encode(map[string]string{
// 		"message": "Post updated successfully",
// 	})
// }

// DeletePostRequest is the request body for deleting a post.
type DeletePostRequest struct {
	ID int64 `json:"id"`
}

// DeletePost deletes a post by ID from JSON body.
func (h *PostHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	var req DeletePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.PostRepository.Delete(req.ID); err != nil {
		http.Error(w, "Failed to delete post", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Post deleted successfully",
	})
}

func (h *PostHandler) GetPostsFromUserByID(w http.ResponseWriter, r *http.Request) {
	var req GetPostRequestFromUserByID
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	token, err := r.Cookie("jwt")
	if err != nil {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	userID := middlewares.CheckJWT(token.Value)
	posts, err := h.PostRepository.GetPostsFromUserByID(req.ID, userID, h.PostService)
	if err != nil {
		http.Error(w, "Failed to retrieve posts", http.StatusInternalServerError)
		return
	}

	var response []PostResponse
	for _, post := range posts {
		// Récupérer les infos de l'utilisateur (username)
		user, err := h.UserRepository.GetByID(post.UserID)
		if err != nil {
			http.Error(w, "Failed to retrieve user info", http.StatusInternalServerError)
			return
		}

		// Nombre de likes pour ce post
		likesCount, err := h.PostRepository.GetLikesCountByPostID(post.ID)
		if err != nil {
			http.Error(w, "Failed to count likes", http.StatusInternalServerError)
			return
		}

		// Vérifier si l'utilisateur (req.ID) a liké ce post
		userLiked := true

		// Nombre de commentaires pour ce post
		commentsCount, err := h.PostRepository.GetCommentsCountByPostID(post.ID)
		if err != nil {
			http.Error(w, "Error retrieving comment count", http.StatusInternalServerError)
			return
		}

		response = append(response, PostResponse{
			Post:          post,
			User:          user.Username,
			Like:          likesCount,
			UserLiked:     userLiked,
			CommentsCount: commentsCount,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *PostHandler) GetLikedPostsByUserId(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		UserID int64 `json:"user_id"`
	}

	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	likedPostIDs, err := h.PostRepository.GetLikedPostsByUserId(req.UserID)
	if err != nil {
		http.Error(w, "Failed to get liked posts", http.StatusInternalServerError)
		return
	}

	type PostWithDetails struct {
		Post          *models.Post `json:"post"`
		Username      string       `json:"user"`
		LikesCount    int          `json:"like"`
		CommentsCount int          `json:"comments_count"`
	}

	var likedPosts []PostWithDetails

	for _, postID := range likedPostIDs {
		post, err := h.PostRepository.GetPostById(postID)
		if err != nil {
			http.Error(w, "Error retrieving post data", http.StatusInternalServerError)
			return
		}
		if post != nil {
			user, err := h.UserRepository.GetByID(post.UserID)
			if err != nil {
				http.Error(w, "Error retrieving user data", http.StatusInternalServerError)
				return
			}

			likeCount, err := h.PostRepository.GetLikesCountByPostID(post.ID)
			if err != nil {
				http.Error(w, "Error retrieving like count", http.StatusInternalServerError)
				return
			}

			commentCount, err := h.PostRepository.GetCommentsCountByPostID(post.ID)
			if err != nil {
				http.Error(w, "Error retrieving comment count", http.StatusInternalServerError)
				return
			}

			likedPosts = append(likedPosts, PostWithDetails{
				Post:          post,
				Username:      user.Username,
				LikesCount:    likeCount,
				CommentsCount: commentCount,
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]any{
		"liked_posts": likedPosts,
	}); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
