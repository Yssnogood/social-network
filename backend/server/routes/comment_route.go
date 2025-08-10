package routes

import (
	"net/http"
	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"

	"github.com/gorilla/mux"
)

// UserRoutes
func CommentsRoutes(r *mux.Router, commentHandler *handlers.CommentHandler) {
	r.Handle("/api/comments", middlewares.JWTMiddleware(http.HandlerFunc(commentHandler.CreateComment))).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/comments/{id}", commentHandler.GetComment).Methods("GET")
	r.HandleFunc("/api/comments_user", commentHandler.GetCommentsFromUserByID).Methods("POST")
	r.Handle("/api/comments/{id}", middlewares.JWTMiddleware(http.HandlerFunc(commentHandler.GetCommentsByPost))).Methods("POST", "OPTIONS")
	r.Handle("/api/comments/{id}", middlewares.JWTMiddleware(http.HandlerFunc(commentHandler.UpdateComment))).Methods("PUT", "OPTIONS")
	r.Handle("/api/comments/{id}", middlewares.JWTMiddleware(http.HandlerFunc(commentHandler.DeleteComment))).Methods("DELETE", "OPTIONS")
}
