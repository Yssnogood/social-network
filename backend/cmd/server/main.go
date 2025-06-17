package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	gorillaHandlers "github.com/gorilla/handlers" // alias pour le package externe handlers

	repository "social-network/backend/database/repositories"
	"social-network/backend/database/sqlite"
	appHandlers "social-network/backend/server/handlers" // alias pour ton propre package handlers
	"social-network/backend/app/services"
	"social-network/backend/server/routes"
	"social-network/backend/server/middlewares"
)

func main() {
	r := mux.NewRouter()

	// Appliquer le middleware CORS
	headersOk := gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	originsOk := gorillaHandlers.AllowedOrigins([]string{"http://localhost:3000"})
	credentialsOk := gorillaHandlers.AllowCredentials()
	methodsOk := gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"})

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erreur loading .env")
	}

	log.Println("DB_PATH =", os.Getenv("DB_PATH"))

	db := sqlite.InitDBAndMigrate()
	defer db.Close()

	log.Println("Serveur ready")

	// Repositories
	userRepo := repository.NewUserRepository(db)
	postRepo := repository.NewPostRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	sessionRepo := repository.NewSessionRepository(db)

	// Services
	userService := services.NewUserService(db)
	postService := services.NewPostService(db)

	// Handlers
	userHandler := appHandlers.NewUserHandler(userService, userRepo, sessionRepo)
	postHandler := appHandlers.NewPostHandler(postService, postRepo, sessionRepo)
	commentHandler := appHandlers.NewCommentHandler(commentRepo, sessionRepo)

	// Routes
	routes.UserRoutes(r, userHandler)
	routes.PostRoutes(r, postHandler)
	routes.CommentsRoutes(r, commentHandler)

	// Middleware
	r.Handle("/api/posts", middlewares.JWTMiddleware(http.HandlerFunc(postHandler.CreatePost))).Methods("POST")

	// Start server
	log.Println("Server start on http://localhost:8080/")
	if err := http.ListenAndServe(":8080", gorillaHandlers.CORS(originsOk, headersOk, methodsOk, credentialsOk)(r)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
