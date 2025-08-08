package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	"social-network/backend/server/handlers"
	"social-network/backend/server/middlewares"
)

func UploadRoutes(r *mux.Router, uploadHandler *handlers.UploadHandler) {
	// Image upload endpoint
	r.Handle("/api/upload/image", middlewares.JWTMiddleware(http.HandlerFunc(uploadHandler.UploadImage))).Methods("POST", "OPTIONS")
	
	// Serve uploaded files statically (optional - can be handled by nginx in production)
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))
}