package routes

import (
	"social-network/backend/server/handlers"
	"github.com/gorilla/mux"
)
// UserRoutes
func PostRoutes(r *mux.Router, postHandler *handlers.PostHandler) {
	r.HandleFunc("/api/posts", postHandler.CreatePost).Methods("POST")
	// r.HandleFunc("/api/posts/{id}", postHandler.GetPost.Methods("GET")
	// r.HandleFunc("/api/posts/{id}", postHandler.UpdatePost).Methods("PUT")
	// r.HandleFunc("/api/posts/{id}", postHandler.DeletePost).Methods("DELETE")
}

