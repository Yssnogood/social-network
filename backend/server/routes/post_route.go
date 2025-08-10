package routes

import (
	"net/http"
	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"

	"github.com/gorilla/mux"
)

// UserRoutes
func PostRoutes(r *mux.Router, postHandler *handlers.PostHandler) {
	r.Handle("/api/post", middlewares.JWTMiddleware(http.HandlerFunc(postHandler.CreatePost))).Methods("POST", "OPTIONS")
	r.Handle("/api/posts", middlewares.JWTMiddleware(http.HandlerFunc(postHandler.GetRecentsPosts))).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/posts_user", postHandler.GetPostsFromUserByID).Methods("POST")
	r.Handle("/api/like", middlewares.JWTMiddleware(http.HandlerFunc(postHandler.LikePost))).Methods("POST", "OPTIONS")
	r.Handle("/api/dislike", middlewares.JWTMiddleware(http.HandlerFunc(postHandler.DislikePost))).Methods("POST", "OPTIONS")
	r.Handle("/api/posts/{id}", middlewares.JWTMiddleware(http.HandlerFunc(postHandler.GetPost))).Methods("POST", "OPTIONS")
	// r.HandleFunc("/api/posts/{id}", postHandler.UpdatePost).Methods("PUT")
	r.Handle("/api/posts/{id}", middlewares.JWTMiddleware(http.HandlerFunc(postHandler.DeletePost))).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/api/liked_posts", postHandler.GetLikedPostsByUserId).Methods("POST")

}
