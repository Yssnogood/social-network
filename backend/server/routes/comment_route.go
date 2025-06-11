package routes

import (
	"social-network/backend/server/handlers"

	"github.com/gorilla/mux"
)

// UserRoutes

func CommentsRoutes(r *mux.Router, commentHandler *handlers.CommentHandler) {
	r.HandleFunc("/api/comments", commentHandler.CreateComment).Methods("POST")
	r.HandleFunc("/api/comments/{id}", commentHandler.GetComment).Methods("POST")
	// r.HandleFunc("/api/comments/{id}", commentHandler.UpdateComment).Methods("PUT")
	// r.HandleFunc("/api/comments/{id}", commentHandler.DeleteComment).Methods("DELETE")
}
